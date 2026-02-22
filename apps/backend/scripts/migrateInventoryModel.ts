import dotenv from "dotenv";
import { QueryTypes } from "sequelize";
import sequelize from "../models";

dotenv.config();

const createInventoryTables = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS inventory_levels (
      "itemId" UUID PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "onHand" INTEGER NOT NULL DEFAULT 0,
      "reserved" INTEGER NOT NULL DEFAULT 0,
      "safetyStock" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS inventory_reservations (
      id UUID PRIMARY KEY,
      "itemId" UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
      quantity INTEGER NOT NULL,
      status VARCHAR(32) NOT NULL,
      "expiresAt" TIMESTAMP WITH TIME ZONE NULL,
      "orderId" VARCHAR(255) NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id UUID PRIMARY KEY,
      "itemId" UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "movementType" VARCHAR(32) NOT NULL,
      "quantityDelta" INTEGER NOT NULL,
      note VARCHAR(500) NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_levels_on_hand_idx ON inventory_levels("onHand");
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_levels_reserved_idx ON inventory_levels("reserved");
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_reservations_item_id_idx ON inventory_reservations("itemId");
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_reservations_status_idx ON inventory_reservations(status);
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_reservations_expires_at_idx ON inventory_reservations("expiresAt");
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_movements_item_id_idx ON inventory_movements("itemId");
  `);
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS inventory_movements_type_idx ON inventory_movements("movementType");
  `);
};

const hasTable = async (tableName: string) => {
  const rows = (await sequelize.query(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = :tableName
      LIMIT 1
    `,
    { replacements: { tableName }, type: QueryTypes.SELECT },
  )) as Array<{ "?column?": number }>;
  return rows.length > 0;
};

const hasColumn = async (tableName: string, columnName: string) => {
  const rows = (await sequelize.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = :tableName
        AND column_name = :columnName
      LIMIT 1
    `,
    { replacements: { tableName, columnName }, type: QueryTypes.SELECT },
  )) as Array<{ "?column?": number }>;
  return rows.length > 0;
};

const backfillFromItemUnits = async () => {
  await sequelize.query(`
    INSERT INTO inventory_levels ("itemId", "onHand", "reserved", "safetyStock", "createdAt", "updatedAt")
    SELECT
      iu."itemId",
      SUM(CASE WHEN iu.status IN ('AVAILABLE', 'RESERVED') THEN 1 ELSE 0 END)::int AS "onHand",
      SUM(CASE WHEN iu.status = 'RESERVED' THEN 1 ELSE 0 END)::int AS "reserved",
      0 AS "safetyStock",
      NOW(),
      NOW()
    FROM item_units iu
    GROUP BY iu."itemId"
    ON CONFLICT ("itemId")
    DO UPDATE SET
      "onHand" = EXCLUDED."onHand",
      "reserved" = EXCLUDED."reserved",
      "updatedAt" = NOW();
  `);
};

const backfillFromItemsInventory = async () => {
  await sequelize.query(`
    INSERT INTO inventory_levels ("itemId", "onHand", "reserved", "safetyStock", "createdAt", "updatedAt")
    SELECT
      i.id AS "itemId",
      COALESCE(i.inventory, 0)::int AS "onHand",
      0 AS "reserved",
      0 AS "safetyStock",
      NOW(),
      NOW()
    FROM items i
    ON CONFLICT ("itemId")
    DO UPDATE SET
      "onHand" = EXCLUDED."onHand",
      "updatedAt" = NOW();
  `);
};

const migrate = async () => {
  try {
    await sequelize.authenticate();
    await createInventoryTables();

    const hasItemUnits = await hasTable("item_units");
    if (hasItemUnits) {
      await backfillFromItemUnits();
      console.log("Backfilled inventory_levels from item_units.");
      process.exit(0);
    }

    const hasLegacyInventory = await hasColumn("items", "inventory");
    if (hasLegacyInventory) {
      await backfillFromItemsInventory();
      console.log("Backfilled inventory_levels from items.inventory.");
      process.exit(0);
    }

    console.log("No legacy inventory source found. Created inventory tables only.");
    process.exit(0);
  } catch (error) {
    console.error("Inventory model migration failed:", error);
    process.exit(1);
  }
};

migrate();
