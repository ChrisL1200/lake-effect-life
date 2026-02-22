import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Customer from "./Customer";
import Address from "./Address";

interface OrderAttributes {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  emailAtCheckout: string;
  shippingAddressId?: string | null;
  billingAddressId?: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  placedAt: Date;
}

interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    "id" | "customerId" | "shippingAddressId" | "billingAddressId" | "status" | "currency" | "placedAt"
  > {}

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: string;
  public orderNumber!: string;
  public customerId?: string | null;
  public emailAtCheckout!: string;
  public shippingAddressId?: string | null;
  public billingAddressId?: string | null;
  public status!: string;
  public totalAmount!: number;
  public currency!: string;
  public placedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: "orderNumber",
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Customer, key: "id" },
      field: "customerId",
    },
    emailAtCheckout: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "emailAtCheckout",
    },
    shippingAddressId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Address, key: "id" },
      field: "shippingAddressId",
    },
    billingAddressId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: Address, key: "id" },
      field: "billingAddressId",
    },
    status: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: "PENDING",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "totalAmount",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
    placedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "placedAt",
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  },
);

Customer.hasMany(Order, { as: "orders", foreignKey: "customerId" });
Order.belongsTo(Customer, { as: "customer", foreignKey: "customerId" });
Order.belongsTo(Address, { as: "shippingAddress", foreignKey: "shippingAddressId" });
Order.belongsTo(Address, { as: "billingAddress", foreignKey: "billingAddressId" });

export default Order;
