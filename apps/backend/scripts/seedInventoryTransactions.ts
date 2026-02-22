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

const seed = async () => {
  try {
    await sequelize.authenticate();
    const items = await Item.findAll({ attributes: ["id"], limit: 10, order: [["createdAt", "ASC"]] });
    if (items.length === 0) {
      console.error("No items found. Seed inventory first.");
      process.exit(1);
    }

    const now = Date.now();
    const rows = templates.map((template, index) => ({
      itemId: items[index % items.length].id,
      movementType: template.movementType,
      quantityDelta: template.quantityDelta,
      note: template.note,
      createdAt: new Date(now - (templates.length - index) * 60 * 60 * 1000),
      updatedAt: new Date(now - (templates.length - index) * 60 * 60 * 1000),
    }));

    await InventoryMovement.bulkCreate(rows);
    console.log(`Seeded ${rows.length} inventory transaction rows.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed seeding inventory transactions:", error);
    process.exit(1);
  }
};

seed();
