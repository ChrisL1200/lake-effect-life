import { DataTypes, Model } from "sequelize";
import sequelize from "./index";
import Item from "./Item";

interface InventoryLevelAttributes {
  itemId: string;
  onHand: number;
  reserved: number;
  safetyStock: number;
}

class InventoryLevel
  extends Model<InventoryLevelAttributes>
  implements InventoryLevelAttributes
{
  public itemId!: string;
  public onHand!: number;
  public reserved!: number;
  public safetyStock!: number;
}

InventoryLevel.init(
  {
    itemId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: Item,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    onHand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    reserved: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    safetyStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    modelName: "InventoryLevel",
    tableName: "inventory_levels",
    timestamps: true,
    indexes: [{ fields: ["onHand"] }, { fields: ["reserved"] }],
  },
);

Item.hasOne(InventoryLevel, { as: "inventoryLevel", foreignKey: "itemId" });
InventoryLevel.belongsTo(Item, { as: "item", foreignKey: "itemId" });

export default InventoryLevel;
