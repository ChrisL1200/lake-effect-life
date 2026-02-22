import dotenv from "dotenv";
import sequelize from "../models";
import Item from "../models/Item";
import InventoryMovement, {
  INVENTORY_MOVEMENT_TYPE_ADJUSTMENT,
  INVENTORY_MOVEMENT_TYPE_ADMIN_SET,
  INVENTORY_MOVEMENT_TYPE_RELEASE,
  INVENTORY_MOVEMENT_TYPE_RESERVE,
  INVENTORY_MOVEMENT_TYPE_SALE,
  InventoryMovementType,
} from "../models/InventoryMovement";
import Customer from "../models/Customer";
import Address from "../models/Address";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Payment from "../models/Payment";
import Shipment from "../models/Shipment";
import ShipmentItem from "../models/ShipmentItem";
import ItemColor from "../models/ItemColor";
import GroupedItem from "../models/GroupedItem";

dotenv.config();

interface MovementTemplate {
  movementType: InventoryMovementType;
  quantityDelta: number;
  note: string;
}

const templates: MovementTemplate[] = [
  { movementType: INVENTORY_MOVEMENT_TYPE_ADMIN_SET, quantityDelta: 12, note: "Initial admin stock set" },
  { movementType: INVENTORY_MOVEMENT_TYPE_RESERVE, quantityDelta: -2, note: "Checkout reservation hold" },
  { movementType: INVENTORY_MOVEMENT_TYPE_RELEASE, quantityDelta: 1, note: "Reservation partially released" },
  { movementType: INVENTORY_MOVEMENT_TYPE_SALE, quantityDelta: -1, note: "Order paid and captured" },
  { movementType: INVENTORY_MOVEMENT_TYPE_ADJUSTMENT, quantityDelta: -1, note: "Cycle count shrink adjustment" },
  { movementType: INVENTORY_MOVEMENT_TYPE_ADMIN_SET, quantityDelta: 8, note: "Seasonal restock" },
  { movementType: INVENTORY_MOVEMENT_TYPE_RESERVE, quantityDelta: -3, note: "Multi-item reservation" },
  { movementType: INVENTORY_MOVEMENT_TYPE_RELEASE, quantityDelta: 2, note: "Expired reservation release" },
  { movementType: INVENTORY_MOVEMENT_TYPE_SALE, quantityDelta: -2, note: "Fulfilled shipment conversion" },
  { movementType: INVENTORY_MOVEMENT_TYPE_ADJUSTMENT, quantityDelta: 1, note: "Damaged return recovered to stock" },
];

const firstNames = ["Ava", "Noah", "Liam", "Mia", "Ethan", "Olivia", "Mason", "Emma", "Lucas", "Sophia"];
const lastNames = ["Turner", "Reed", "Parker", "Cole", "Foster", "Bryant", "Hayes", "Brooks", "Ward", "Perry"];
const cities = ["Buffalo", "Rochester", "Cleveland", "Erie", "Toledo", "Syracuse", "Detroit", "Grand Rapids", "Chicago", "Milwaukee"];
const states = ["NY", "NY", "OH", "PA", "OH", "NY", "MI", "MI", "IL", "WI"];

const seed = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.query(`
      DELETE FROM inventory_movements
      WHERE note LIKE '%| Order MOCK-%';
    `);
    await sequelize.query(`
      DELETE FROM orders
      WHERE "orderNumber" LIKE 'MOCK-%';
    `);
    await sequelize.query(`
      DELETE FROM addresses
      WHERE line1 LIKE '% Harbor View Dr'
        AND "postalCode" LIKE '14%';
    `);
    await sequelize.query(`
      DELETE FROM customers
      WHERE email LIKE 'guest+txn%@example.com';
    `);

    const items = await Item.findAll({
      attributes: ["id", "size", "price", "itemColorId"],
      limit: 10,
      order: [["createdAt", "ASC"]],
    });

    if (items.length === 0) {
      console.error("No items found. Seed inventory first.");
      process.exit(1);
    }

    const now = Date.now();
    const movementRows = templates.map((template, index) => ({
      itemId: items[index % items.length].id,
      movementType: template.movementType,
      quantityDelta: template.quantityDelta,
      note: template.note,
      createdAt: new Date(now - (templates.length - index) * 60 * 60 * 1000),
      updatedAt: new Date(now - (templates.length - index) * 60 * 60 * 1000),
    }));

    const movements = await InventoryMovement.bulkCreate(movementRows, { returning: true });

    for (let index = 0; index < movements.length; index++) {
      const movement = movements[index];
      const item = items[index % items.length];
      const firstName = firstNames[index % firstNames.length];
      const lastName = lastNames[index % lastNames.length];
      const city = cities[index % cities.length];
      const state = states[index % states.length];

      const customer = await Customer.create({
        email: `guest+txn${Date.now()}_${index}@example.com`,
        firstName,
        lastName,
        phone: `555-010${index}`,
        isGuest: index % 3 !== 0,
      });

      const address = await Address.create({
        customerId: customer.id,
        firstName,
        lastName,
        line1: `${100 + index} Harbor View Dr`,
        city,
        state,
        postalCode: `14${String(100 + index).slice(-3)}`,
        country: "US",
      });

      const qty = Math.max(1, Math.abs(movement.quantityDelta));
      const unitPrice = Number(item.price || 29.99);
      const lineTotal = Number((qty * unitPrice).toFixed(2));

      const order = await Order.create({
        orderNumber: `MOCK-${Date.now()}-${index}`,
        customerId: customer.id,
        emailAtCheckout: customer.email,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        status: index % 2 === 0 ? "PAID" : "PROCESSING",
        totalAmount: lineTotal,
        currency: "USD",
        placedAt: new Date(now - (templates.length - index) * 60 * 60 * 1000),
      });

      const itemColor = item.itemColorId
        ? await ItemColor.findByPk(item.itemColorId, { attributes: ["color", "groupedItemId"] })
        : null;
      const groupedItem = itemColor?.groupedItemId
        ? await GroupedItem.findByPk(itemColor.groupedItemId, { attributes: ["id"] })
        : null;

      const orderItem = await OrderItem.create({
        orderId: order.id,
        itemId: item.id,
        itemNameSnapshot: groupedItem?.id || "Lake Effect Item",
        skuSnapshot: `SKU-${item.id.slice(0, 8).toUpperCase()}`,
        sizeSnapshot: item.size,
        colorSnapshot: itemColor?.color || null,
        quantity: qty,
        unitPrice,
        lineTotal,
      });

      await Payment.create({
        orderId: order.id,
        provider: "stripe",
        providerPaymentId: `pi_mock_${Date.now()}_${index}`,
        status: index % 4 === 0 ? "REFUNDED" : "CAPTURED",
        amount: lineTotal,
        currency: "USD",
        processedAt: new Date(now - (templates.length - index - 1) * 60 * 60 * 1000),
      });

      const shipmentStatus = index % 3 === 0 ? "PENDING" : index % 3 === 1 ? "SHIPPED" : "DELIVERED";
      const shippedAt = shipmentStatus === "PENDING" ? null : new Date(now - (templates.length - index - 1) * 30 * 60 * 1000);
      const deliveredAt = shipmentStatus === "DELIVERED" ? new Date(now - (templates.length - index - 1) * 10 * 60 * 1000) : null;

      const shipment = await Shipment.create({
        orderId: order.id,
        status: shipmentStatus,
        carrier: shipmentStatus === "PENDING" ? null : "UPS",
        serviceLevel: shipmentStatus === "PENDING" ? null : "Ground",
        trackingNumber: shipmentStatus === "PENDING" ? null : `1ZMOCK${String(index).padStart(6, "0")}`,
        shippedAt,
        deliveredAt,
      });

      await ShipmentItem.create({
        shipmentId: shipment.id,
        orderItemId: orderItem.id,
        quantity: qty,
      });

      await movement.update({
        orderId: order.id,
        note: `${movement.note} | Order ${order.orderNumber}`,
      });
    }

    console.log(`Seeded ${movements.length} commerce-linked transactions.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed seeding commerce transactions:", error);
    process.exit(1);
  }
};

seed();
