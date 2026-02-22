import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import ItemColor from "./ItemColor";
import { ItemSizeLookup } from "./InventoryLookups";

export type ItemSize = string;

interface ItemAttributes {
  id: string;
  price: number;
  size: ItemSize;
  inventory?: number;
  itemColorId?: string;
}

interface ItemCreationAttributes extends Optional<ItemAttributes, "id"> {}

class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: string;
  public price!: number;
  public size!: ItemSize;
  public inventory?: number;
  public itemColorId?: string;
}

Item.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ItemSizeLookup,
        key: "value",
      },
    },
    inventory: {
      type: DataTypes.VIRTUAL(DataTypes.INTEGER),
      get(this: Item) {
        return this.getDataValue("inventory") ?? 0;
      },
      set(this: Item, value: number) {
        this.setDataValue("inventory", value);
      },
    },
    itemColorId: {
      type: DataTypes.UUID,
      references: {
        model: ItemColor,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Item",
    tableName: "items",
    timestamps: true,
  },
);

// Associations
ItemColor.hasMany(Item, { as: "items", foreignKey: "itemColorId" });
Item.belongsTo(ItemColor, { as: "itemColor", foreignKey: "itemColorId" });

ItemSizeLookup.hasMany(Item, {
  as: "itemsBySize",
  foreignKey: "size",
  sourceKey: "value",
});
Item.belongsTo(ItemSizeLookup, {
  as: "sizeLookup",
  foreignKey: "size",
  targetKey: "value",
});

export default Item;
