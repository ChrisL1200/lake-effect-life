import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Item from "./Item";

export const INVENTORY_RESERVATION_STATUS_ACTIVE = "ACTIVE";
export const INVENTORY_RESERVATION_STATUS_RELEASED = "RELEASED";
export const INVENTORY_RESERVATION_STATUS_CONVERTED = "CONVERTED";
export const INVENTORY_RESERVATION_STATUS_EXPIRED = "EXPIRED";

export type InventoryReservationStatus =
  | typeof INVENTORY_RESERVATION_STATUS_ACTIVE
  | typeof INVENTORY_RESERVATION_STATUS_RELEASED
  | typeof INVENTORY_RESERVATION_STATUS_CONVERTED
  | typeof INVENTORY_RESERVATION_STATUS_EXPIRED;

interface InventoryReservationAttributes {
  id: string;
  itemId: string;
  quantity: number;
  status: InventoryReservationStatus;
  expiresAt?: Date | null;
  orderId?: string | null;
}

interface InventoryReservationCreationAttributes
  extends Optional<InventoryReservationAttributes, "id" | "expiresAt" | "orderId"> {}

class InventoryReservation
  extends Model<
    InventoryReservationAttributes,
    InventoryReservationCreationAttributes
  >
  implements InventoryReservationAttributes
{
  public id!: string;
  public itemId!: string;
  public quantity!: number;
  public status!: InventoryReservationStatus;
  public expiresAt?: Date | null;
  public orderId?: string | null;
}

InventoryReservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Item,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: INVENTORY_RESERVATION_STATUS_ACTIVE,
      validate: {
        isIn: [
          [
            INVENTORY_RESERVATION_STATUS_ACTIVE,
            INVENTORY_RESERVATION_STATUS_RELEASED,
            INVENTORY_RESERVATION_STATUS_CONVERTED,
            INVENTORY_RESERVATION_STATUS_EXPIRED,
          ],
        ],
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "InventoryReservation",
    tableName: "inventory_reservations",
    timestamps: true,
    indexes: [{ fields: ["itemId"] }, { fields: ["status"] }, { fields: ["expiresAt"] }],
  },
);

Item.hasMany(InventoryReservation, { as: "inventoryReservations", foreignKey: "itemId" });
InventoryReservation.belongsTo(Item, { as: "item", foreignKey: "itemId" });

export default InventoryReservation;
