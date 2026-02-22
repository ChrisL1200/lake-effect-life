import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Item from "./Item";

export const INVENTORY_MOVEMENT_TYPE_ADMIN_SET = "ADMIN_SET";
export const INVENTORY_MOVEMENT_TYPE_RESERVE = "RESERVE";
export const INVENTORY_MOVEMENT_TYPE_RELEASE = "RELEASE";
export const INVENTORY_MOVEMENT_TYPE_SALE = "SALE";
export const INVENTORY_MOVEMENT_TYPE_ADJUSTMENT = "ADJUSTMENT";

export type InventoryMovementType =
  | typeof INVENTORY_MOVEMENT_TYPE_ADMIN_SET
  | typeof INVENTORY_MOVEMENT_TYPE_RESERVE
  | typeof INVENTORY_MOVEMENT_TYPE_RELEASE
  | typeof INVENTORY_MOVEMENT_TYPE_SALE
  | typeof INVENTORY_MOVEMENT_TYPE_ADJUSTMENT;

interface InventoryMovementAttributes {
  id: string;
  itemId: string;
  orderId?: string | null;
  movementType: InventoryMovementType;
  quantityDelta: number;
  note?: string | null;
}

interface InventoryMovementCreationAttributes
  extends Optional<InventoryMovementAttributes, "id" | "orderId" | "note"> {}

class InventoryMovement
  extends Model<InventoryMovementAttributes, InventoryMovementCreationAttributes>
  implements InventoryMovementAttributes
{
  public id!: string;
  public itemId!: string;
  public orderId?: string | null;
  public movementType!: InventoryMovementType;
  public quantityDelta!: number;
  public note?: string | null;
}

InventoryMovement.init(
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
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "orders",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    movementType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            INVENTORY_MOVEMENT_TYPE_ADMIN_SET,
            INVENTORY_MOVEMENT_TYPE_RESERVE,
            INVENTORY_MOVEMENT_TYPE_RELEASE,
            INVENTORY_MOVEMENT_TYPE_SALE,
            INVENTORY_MOVEMENT_TYPE_ADJUSTMENT,
          ],
        ],
      },
    },
    quantityDelta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "InventoryMovement",
    tableName: "inventory_movements",
    timestamps: true,
    indexes: [{ fields: ["itemId"] }, { fields: ["orderId"] }, { fields: ["movementType"] }],
  },
);

Item.hasMany(InventoryMovement, { as: "inventoryMovements", foreignKey: "itemId" });
InventoryMovement.belongsTo(Item, { as: "item", foreignKey: "itemId" });

export default InventoryMovement;
