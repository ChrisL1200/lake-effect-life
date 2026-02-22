import dotenv from "dotenv";
import sequelize from "../models";
import {
  DEFAULT_COLORS,
  DEFAULT_ITEM_GENDERS,
  DEFAULT_ITEM_SIZES,
  DEFAULT_ITEM_TYPES,
} from "../models/InventoryLookups";

dotenv.config();

const createLookupTables = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS item_types (
      value VARCHAR(64) PRIMARY KEY
    );
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS item_genders (
      value VARCHAR(64) PRIMARY KEY
    );
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS colors (
      value VARCHAR(64) PRIMARY KEY
    );
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS item_sizes (
      value VARCHAR(64) PRIMARY KEY
    );
  `);
};

const seedDefaults = async () => {
  for (const value of DEFAULT_ITEM_TYPES) {
    await sequelize.query(
      `INSERT INTO item_types(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
      { replacements: { value } },
    );
  }
  for (const value of DEFAULT_ITEM_GENDERS) {
    await sequelize.query(
      `INSERT INTO item_genders(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
      { replacements: { value } },
    );
  }
  for (const value of DEFAULT_COLORS) {
    await sequelize.query(
      `INSERT INTO colors(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
      { replacements: { value } },
    );
  }
  for (const value of DEFAULT_ITEM_SIZES) {
    await sequelize.query(
      `INSERT INTO item_sizes(value) VALUES (:value) ON CONFLICT (value) DO NOTHING`,
      { replacements: { value } },
    );
  }
};

const insertExistingValues = async () => {
  await sequelize.query(`
    INSERT INTO item_types(value)
    SELECT DISTINCT type::text
    FROM grouped_items
    WHERE type IS NOT NULL
    ON CONFLICT (value) DO NOTHING;
  `);
  await sequelize.query(`
    INSERT INTO item_genders(value)
    SELECT DISTINCT gender::text
    FROM grouped_items
    WHERE gender IS NOT NULL
    ON CONFLICT (value) DO NOTHING;
  `);
  await sequelize.query(`
    INSERT INTO colors(value)
    SELECT DISTINCT color::text
    FROM item_colors
    WHERE color IS NOT NULL
    ON CONFLICT (value) DO NOTHING;
  `);
  await sequelize.query(`
    INSERT INTO item_sizes(value)
    SELECT DISTINCT size::text
    FROM items
    WHERE size IS NOT NULL
    ON CONFLICT (value) DO NOTHING;
  `);
};

const convertEnumColumnsToText = async () => {
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'grouped_items'
          AND column_name = 'type'
          AND data_type = 'USER-DEFINED'
      ) THEN
        ALTER TABLE grouped_items
        ALTER COLUMN type TYPE VARCHAR(64)
        USING type::text;
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'grouped_items'
          AND column_name = 'gender'
          AND data_type = 'USER-DEFINED'
      ) THEN
        ALTER TABLE grouped_items
        ALTER COLUMN gender TYPE VARCHAR(64)
        USING gender::text;
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'item_colors'
          AND column_name = 'color'
          AND data_type = 'USER-DEFINED'
      ) THEN
        ALTER TABLE item_colors
        ALTER COLUMN color TYPE VARCHAR(64)
        USING color::text;
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'items'
          AND column_name = 'size'
          AND data_type = 'USER-DEFINED'
      ) THEN
        ALTER TABLE items
        ALTER COLUMN size TYPE VARCHAR(64)
        USING size::text;
      END IF;
    END $$;
  `);
};

const addForeignKeys = async () => {
  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'grouped_items_type_lookup_fkey'
      ) THEN
        ALTER TABLE grouped_items
        ADD CONSTRAINT grouped_items_type_lookup_fkey
        FOREIGN KEY (type) REFERENCES item_types(value);
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'grouped_items_gender_lookup_fkey'
      ) THEN
        ALTER TABLE grouped_items
        ADD CONSTRAINT grouped_items_gender_lookup_fkey
        FOREIGN KEY (gender) REFERENCES item_genders(value);
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'item_colors_color_lookup_fkey'
      ) THEN
        ALTER TABLE item_colors
        ADD CONSTRAINT item_colors_color_lookup_fkey
        FOREIGN KEY (color) REFERENCES colors(value);
      END IF;
    END $$;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'items_size_lookup_fkey'
      ) THEN
        ALTER TABLE items
        ADD CONSTRAINT items_size_lookup_fkey
        FOREIGN KEY (size) REFERENCES item_sizes(value);
      END IF;
    END $$;
  `);
};

const dropLegacyEnumTypes = async () => {
  await sequelize.query(`
    DO $$
    DECLARE
      enum_type_name TEXT;
    BEGIN
      FOR enum_type_name IN
        SELECT DISTINCT c.udt_name
        FROM information_schema.columns c
        WHERE (c.table_name, c.column_name) IN (
          ('grouped_items', 'type'),
          ('grouped_items', 'gender'),
          ('item_colors', 'color'),
          ('items', 'size')
        )
          AND c.data_type = 'USER-DEFINED'
      LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I', enum_type_name);
      END LOOP;

      DROP TYPE IF EXISTS enum_grouped_items_type;
      DROP TYPE IF EXISTS enum_grouped_items_gender;
      DROP TYPE IF EXISTS enum_item_colors_color;
      DROP TYPE IF EXISTS enum_items_size;
    END $$;
  `);
};

const migrate = async () => {
  try {
    await sequelize.authenticate();
    await createLookupTables();
    await seedDefaults();
    await insertExistingValues();
    await convertEnumColumnsToText();
    await addForeignKeys();
    await dropLegacyEnumTypes();
    console.log("Lookup migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Lookup migration failed:", error);
    process.exit(1);
  }
};

migrate();
