import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Shipment from "./Shipment";
import OrderItem from "./OrderItem";

interface ShipmentItemAttributes {
  id: string;
  shipmentId: string;
  orderItemId: string;
  quantity: number;
}

interface ShipmentItemCreationAttributes extends Optional<ShipmentItemAttributes, "id" | "quantity"> {}

class ShipmentItem
  extends Model<ShipmentItemAttributes, ShipmentItemCreationAttributes>
  implements ShipmentItemAttributes
{
  public id!: string;
  public shipmentId!: string;
  public orderItemId!: string;
  public quantity!: number;
}

ShipmentItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Shipment, key: "id" },
      field: "shipmentId",
    },
    orderItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: OrderItem, key: "id" },
      field: "orderItemId",
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "ShipmentItem",
    tableName: "shipment_items",
    timestamps: true,
  },
);

Shipment.hasMany(ShipmentItem, { as: "items", foreignKey: "shipmentId" });
ShipmentItem.belongsTo(Shipment, { as: "shipment", foreignKey: "shipmentId" });
OrderItem.hasMany(ShipmentItem, { as: "shipmentItems", foreignKey: "orderItemId" });
ShipmentItem.belongsTo(OrderItem, { as: "orderItem", foreignKey: "orderItemId" });

export default ShipmentItem;
