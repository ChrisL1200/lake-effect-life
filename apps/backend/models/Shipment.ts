import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Order from "./Order";

interface ShipmentAttributes {
  id: string;
  orderId: string;
  status: string;
  carrier?: string | null;
  serviceLevel?: string | null;
  trackingNumber?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
}

interface ShipmentCreationAttributes
  extends Optional<
    ShipmentAttributes,
    "id" | "carrier" | "serviceLevel" | "trackingNumber" | "shippedAt" | "deliveredAt"
  > {}

class Shipment
  extends Model<ShipmentAttributes, ShipmentCreationAttributes>
  implements ShipmentAttributes
{
  public id!: string;
  public orderId!: string;
  public status!: string;
  public carrier?: string | null;
  public serviceLevel?: string | null;
  public trackingNumber?: string | null;
  public shippedAt?: Date | null;
  public deliveredAt?: Date | null;
}

Shipment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Order, key: "id" },
      field: "orderId",
    },
    status: { type: DataTypes.STRING(64), allowNull: false },
    carrier: { type: DataTypes.STRING(120), allowNull: true },
    serviceLevel: { type: DataTypes.STRING(120), allowNull: true, field: "serviceLevel" },
    trackingNumber: { type: DataTypes.STRING(120), allowNull: true, field: "trackingNumber" },
    shippedAt: { type: DataTypes.DATE, allowNull: true, field: "shippedAt" },
    deliveredAt: { type: DataTypes.DATE, allowNull: true, field: "deliveredAt" },
  },
  {
    sequelize,
    modelName: "Shipment",
    tableName: "shipments",
    timestamps: true,
  },
);

Order.hasMany(Shipment, { as: "shipments", foreignKey: "orderId" });
Shipment.belongsTo(Order, { as: "order", foreignKey: "orderId" });

export default Shipment;
