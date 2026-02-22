import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import Customer from "./Customer";

interface AddressAttributes {
  id: string;
  customerId?: string | null;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressCreationAttributes
  extends Optional<AddressAttributes, "id" | "customerId" | "line2"> {}

class Address
  extends Model<AddressAttributes, AddressCreationAttributes>
  implements AddressAttributes
{
  public id!: string;
  public customerId?: string | null;
  public firstName!: string;
  public lastName!: string;
  public line1!: string;
  public line2?: string | null;
  public city!: string;
  public state!: string;
  public postalCode!: string;
  public country!: string;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Customer,
        key: "id",
      },
      field: "customerId",
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "firstName",
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "lastName",
    },
    line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: "postalCode",
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Address",
    tableName: "addresses",
    timestamps: true,
  },
);

Customer.hasMany(Address, { as: "addresses", foreignKey: "customerId" });
Address.belongsTo(Customer, { as: "customer", foreignKey: "customerId" });

export default Address;
