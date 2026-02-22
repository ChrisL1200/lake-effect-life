import dotenv from "dotenv";
import sequelize from "../models";

dotenv.config();

const createTables = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      "firstName" VARCHAR(255) NULL,
      "lastName" VARCHAR(255) NULL,
      phone VARCHAR(50) NULL,
      "isGuest" BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS customer_identities (
      id UUID PRIMARY KEY,
      "customerId" UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
      provider VARCHAR(64) NOT NULL,
      "providerUserId" VARCHAR(255) NOT NULL,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      UNIQUE(provider, "providerUserId")
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS addresses (
      id UUID PRIMARY KEY,
      "customerId" UUID NULL REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
      "firstName" VARCHAR(255) NOT NULL,
      "lastName" VARCHAR(255) NOT NULL,
      line1 VARCHAR(255) NOT NULL,
      line2 VARCHAR(255) NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(120) NOT NULL,
      "postalCode" VARCHAR(32) NOT NULL,
      country VARCHAR(2) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      "orderNumber" VARCHAR(64) NOT NULL UNIQUE,
      "customerId" UUID NULL REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
      "emailAtCheckout" VARCHAR(255) NOT NULL,
      "shippingAddressId" UUID NULL REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE,
      "billingAddressId" UUID NULL REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE,
      status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
      "totalAmount" DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'USD',
      "placedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY,
      "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "itemId" UUID NULL REFERENCES items(id) ON DELETE SET NULL ON UPDATE CASCADE,
      "itemNameSnapshot" VARCHAR(255) NOT NULL,
      "skuSnapshot" VARCHAR(128) NOT NULL,
      "sizeSnapshot" VARCHAR(64) NULL,
      "colorSnapshot" VARCHAR(64) NULL,
      quantity INTEGER NOT NULL,
      "unitPrice" DECIMAL(10, 2) NOT NULL,
      "lineTotal" DECIMAL(10, 2) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY,
      "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
      provider VARCHAR(64) NOT NULL,
      "providerPaymentId" VARCHAR(255) NULL,
      status VARCHAR(64) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'USD',
      "processedAt" TIMESTAMP WITH TIME ZONE NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id UUID PRIMARY KEY,
      "orderId" UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
      status VARCHAR(64) NOT NULL,
      carrier VARCHAR(120) NULL,
      "serviceLevel" VARCHAR(120) NULL,
      "trackingNumber" VARCHAR(120) NULL,
      "shippedAt" TIMESTAMP WITH TIME ZONE NULL,
      "deliveredAt" TIMESTAMP WITH TIME ZONE NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS shipment_items (
      id UUID PRIMARY KEY,
      "shipmentId" UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE ON UPDATE CASCADE,
      "orderItemId" UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`
    ALTER TABLE inventory_movements
    ADD COLUMN IF NOT EXISTS "orderId" UUID NULL;
  `);

  await sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'inventory_movements_order_id_fkey'
      ) THEN
        ALTER TABLE inventory_movements
        ADD CONSTRAINT inventory_movements_order_id_fkey
        FOREIGN KEY ("orderId") REFERENCES orders(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  await sequelize.query(`CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(email);`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS addresses_customer_id_idx ON addresses("customerId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders("customerId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items("orderId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments("orderId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS shipments_order_id_idx ON shipments("orderId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS shipment_items_shipment_id_idx ON shipment_items("shipmentId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS inventory_movements_order_id_idx ON inventory_movements("orderId");`);
};

const migrate = async () => {
  try {
    await sequelize.authenticate();
    await createTables();
    console.log("Commerce model migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Commerce model migration failed:", error);
    process.exit(1);
  }
};

migrate();
