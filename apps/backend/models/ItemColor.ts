import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import GroupedItem from "./GroupedItem";
import { ColorLookup } from "./InventoryLookups";

export type Color = string;

interface ItemColorAttributes {
  id: string;
  color: Color;
  groupedItemId?: string;
  imgUrls: string[];
}

interface ItemColorCreationAttributes
  extends Optional<ItemColorAttributes, "id"> {}

class ItemColor
  extends Model<ItemColorAttributes, ItemColorCreationAttributes>
  implements ItemColorAttributes
{
  public id!: string;
  public color!: Color;
  public groupedItemId?: string;
  public imgUrls!: string[];
}

ItemColor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ColorLookup,
        key: "value",
      },
    },
    groupedItemId: {
      type: DataTypes.STRING,
      references: {
        model: GroupedItem,
        key: "id",
      },
    },
    imgUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ItemColor",
    tableName: "item_colors",
    timestamps: true,
  },
);

// Associations
GroupedItem.hasMany(ItemColor, {
  as: "itemColors",
  foreignKey: "groupedItemId",
});
ItemColor.belongsTo(GroupedItem, {
  as: "groupedItem",
  foreignKey: "groupedItemId",
});

ColorLookup.hasMany(ItemColor, {
  as: "itemColorsByColor",
  foreignKey: "color",
  sourceKey: "value",
});
ItemColor.belongsTo(ColorLookup, {
  as: "colorLookup",
  foreignKey: "color",
  targetKey: "value",
});

export default ItemColor;
