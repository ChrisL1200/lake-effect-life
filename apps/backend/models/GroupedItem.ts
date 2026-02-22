import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./index";
import { ItemGenderLookup, ItemTypeLookup } from "./InventoryLookups";

export type ItemType = string;
export type ItemGender = string;

interface GroupedItemAttributes {
  id: string;
  type: ItemType;
  gender: ItemGender;
}

interface GroupedItemCreationAttributes
  extends Optional<GroupedItemAttributes, "id"> {}

class GroupedItem
  extends Model<GroupedItemAttributes, GroupedItemCreationAttributes>
  implements GroupedItemAttributes
{
  public id!: string;
  public type!: ItemType;
  public gender!: ItemGender;
}

GroupedItem.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ItemTypeLookup,
        key: "value",
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: ItemGenderLookup,
        key: "value",
      },
    },
  },
  {
    sequelize,
    modelName: "GroupedItem",
    tableName: "grouped_items",
    timestamps: true,
  },
);

ItemTypeLookup.hasMany(GroupedItem, {
  as: "groupedItemsByType",
  foreignKey: "type",
  sourceKey: "value",
});
GroupedItem.belongsTo(ItemTypeLookup, {
  as: "typeLookup",
  foreignKey: "type",
  targetKey: "value",
});

ItemGenderLookup.hasMany(GroupedItem, {
  as: "groupedItemsByGender",
  foreignKey: "gender",
  sourceKey: "value",
});
GroupedItem.belongsTo(ItemGenderLookup, {
  as: "genderLookup",
  foreignKey: "gender",
  targetKey: "value",
});

export default GroupedItem;
