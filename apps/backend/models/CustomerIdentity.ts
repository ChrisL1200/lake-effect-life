import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Customer from "./Customer";

interface CustomerIdentityAttributes {
  id: string;
  customerId: string;
  provider: string;
  providerUserId: string;
  emailVerified: boolean;
}

interface CustomerIdentityCreationAttributes
  extends Optional<CustomerIdentityAttributes, "id" | "emailVerified"> {}

class CustomerIdentity
  extends Model<CustomerIdentityAttributes, CustomerIdentityCreationAttributes>
  implements CustomerIdentityAttributes
{
  public id!: string;
  public customerId!: string;
  public provider!: string;
  public providerUserId!: string;
  public emailVerified!: boolean;
}

CustomerIdentity.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
      field: "customerId",
    },
    provider: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    providerUserId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "providerUserId",
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "emailVerified",
    },
  },
  {
    sequelize,
    modelName: "CustomerIdentity",
    tableName: "customer_identities",
    timestamps: true,
    indexes: [{ unique: true, fields: ["provider", "providerUserId"] }],
  },
);

Customer.hasMany(CustomerIdentity, { as: "identities", foreignKey: "customerId" });
CustomerIdentity.belongsTo(Customer, { as: "customer", foreignKey: "customerId" });

export default CustomerIdentity;
