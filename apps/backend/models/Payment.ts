import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Order from "./Order";

interface PaymentAttributes {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId?: string | null;
  status: string;
  amount: number;
  currency: string;
  processedAt?: Date | null;
}

interface PaymentCreationAttributes
  extends Optional<PaymentAttributes, "id" | "providerPaymentId" | "currency" | "processedAt"> {}

class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: string;
  public orderId!: string;
  public provider!: string;
  public providerPaymentId?: string | null;
  public status!: string;
  public amount!: number;
  public currency!: string;
  public processedAt?: Date | null;
}

Payment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Order, key: "id" },
      field: "orderId",
    },
    provider: { type: DataTypes.STRING(64), allowNull: false },
    providerPaymentId: { type: DataTypes.STRING(255), allowNull: true, field: "providerPaymentId" },
    status: { type: DataTypes.STRING(64), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "USD" },
    processedAt: { type: DataTypes.DATE, allowNull: true, field: "processedAt" },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  },
);

Order.hasMany(Payment, { as: "payments", foreignKey: "orderId" });
Payment.belongsTo(Order, { as: "order", foreignKey: "orderId" });

export default Payment;
