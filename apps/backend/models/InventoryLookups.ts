import { DataTypes, Model } from "sequelize";
import sequelize from "./index";

export const DEFAULT_ITEM_TYPES = [
  "T-Shirt",
  "Long Sleeve",
  "Hoodie",
  "Jacket",
  "Sweatshirt",
  "Tank Top",
] as const;

export const DEFAULT_ITEM_GENDERS = ["Men", "Women", "Kids"] as const;

export const DEFAULT_COLORS = [
  "Blue",
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Purple",
] as const;

export const DEFAULT_ITEM_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

interface LookupAttributes {
  value: string;
}

class ItemTypeLookup extends Model<LookupAttributes> implements LookupAttributes {
  public value!: string;
}

class ItemGenderLookup
  extends Model<LookupAttributes>
  implements LookupAttributes
{
  public value!: string;
}

class ColorLookup extends Model<LookupAttributes> implements LookupAttributes {
  public value!: string;
}

class ItemSizeLookup extends Model<LookupAttributes> implements LookupAttributes {
  public value!: string;
}

const lookupModelConfig = {
  value: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
};

ItemTypeLookup.init(lookupModelConfig, {
  sequelize,
  modelName: "ItemTypeLookup",
  tableName: "item_types",
  timestamps: false,
});

ItemGenderLookup.init(lookupModelConfig, {
  sequelize,
  modelName: "ItemGenderLookup",
  tableName: "item_genders",
  timestamps: false,
});

ColorLookup.init(lookupModelConfig, {
  sequelize,
  modelName: "ColorLookup",
  tableName: "colors",
  timestamps: false,
});

ItemSizeLookup.init(lookupModelConfig, {
  sequelize,
  modelName: "ItemSizeLookup",
  tableName: "item_sizes",
  timestamps: false,
});

export { ItemTypeLookup, ItemGenderLookup, ColorLookup, ItemSizeLookup };
