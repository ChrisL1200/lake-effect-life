import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Order from "./Order";
import Item from "./Item";

interface OrderItemAttributes {
  id: string;
  orderId: string;
  itemId?: string | null;
  itemNameSnapshot: string;
  skuSnapshot: string;
  sizeSnapshot?: string | null;
  colorSnapshot?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface OrderItemCreationAttributes
  extends Optional<OrderItemAttributes, "id" | "itemId" | "sizeSnapshot" | "colorSnapshot"> {}

class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: string;
  public orderId!: string;
  public itemId?: string | null;
  public itemNameSnapshot!: string;
  public skuSnapshot!: string;
  public sizeSnapshot?: string | null;
  public colorSnapshot?: string | null;
  public quantity!: number;
  public unitPrice!: number;
  public lineTotal!: number;
}

OrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Order, key: "id" },
      field: "orderId",
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Item, key: "id" },
      field: "itemId",
    },
    itemNameSnapshot: { type: DataTypes.STRING(255), allowNull: false, field: "itemNameSnapshot" },
    skuSnapshot: { type: DataTypes.STRING(128), allowNull: false, field: "skuSnapshot" },
    sizeSnapshot: { type: DataTypes.STRING(64), allowNull: true, field: "sizeSnapshot" },
    colorSnapshot: { type: DataTypes.STRING(64), allowNull: true, field: "colorSnapshot" },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "unitPrice" },
    lineTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "lineTotal" },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true,
  },
);

Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { as: "order", foreignKey: "orderId" });
OrderItem.belongsTo(Item, { as: "item", foreignKey: "itemId" });

export default OrderItem;
