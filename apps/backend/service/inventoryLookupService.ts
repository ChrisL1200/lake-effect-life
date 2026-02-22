import {
  ColorLookup,
  ItemGenderLookup,
  ItemSizeLookup,
  ItemTypeLookup,
} from "../models/InventoryLookups";

export interface InventoryLookups {
  types: string[];
  genders: string[];
  colors: string[];
  sizes: string[];
}

const toValues = <T extends { value: string }>(rows: T[]) =>
  rows.map((row) => row.value);

export const getInventoryLookups = async (): Promise<InventoryLookups> => {
  const [types, genders, colors, sizes] = await Promise.all([
    ItemTypeLookup.findAll({ order: [["value", "ASC"]] }),
    ItemGenderLookup.findAll({ order: [["value", "ASC"]] }),
    ColorLookup.findAll({ order: [["value", "ASC"]] }),
    ItemSizeLookup.findAll({ order: [["value", "ASC"]] }),
  ]);

  return {
    types: toValues(types),
    genders: toValues(genders),
    colors: toValues(colors),
    sizes: toValues(sizes),
  };
};

export const getInventoryLookupSets = async () => {
  const lookups = await getInventoryLookups();
  return {
    types: new Set(lookups.types),
    genders: new Set(lookups.genders),
    colors: new Set(lookups.colors),
    sizes: new Set(lookups.sizes),
  };
};
