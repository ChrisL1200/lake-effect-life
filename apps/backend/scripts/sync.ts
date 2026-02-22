// scripts/sync.ts
import dotenv from "dotenv";
dotenv.config();

import sequelize from "../models";
import GroupedItem from "../models/GroupedItem";
import ItemColor from "../models/ItemColor";
import Item from "../models/Item";
import InventoryLevel from "../models/InventoryLevel";
import InventoryReservation from "../models/InventoryReservation";
import InventoryMovement from "../models/InventoryMovement";
import {
  ColorLookup,
  DEFAULT_COLORS,
  DEFAULT_ITEM_GENDERS,
  DEFAULT_ITEM_SIZES,
  DEFAULT_ITEM_TYPES,
  ItemGenderLookup,
  ItemSizeLookup,
  ItemTypeLookup,
} from "../models/InventoryLookups";
// Import other models if necessary

const sync = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    await ItemTypeLookup.sync({ force: true });
    await ItemGenderLookup.sync({ force: true });
    await ColorLookup.sync({ force: true });
    await ItemSizeLookup.sync({ force: true });

    await Promise.all([
      ...DEFAULT_ITEM_TYPES.map((value) => ItemTypeLookup.create({ value })),
      ...DEFAULT_ITEM_GENDERS.map((value) => ItemGenderLookup.create({ value })),
      ...DEFAULT_COLORS.map((value) => ColorLookup.create({ value })),
      ...DEFAULT_ITEM_SIZES.map((value) => ItemSizeLookup.create({ value })),
    ]);

    await GroupedItem.sync({ force: true });
    await ItemColor.sync({ force: true });
    await Item.sync({ force: true });
    await InventoryLevel.sync({ force: true });
    await InventoryReservation.sync({ force: true });
    await InventoryMovement.sync({ force: true });
    console.log("Registered models:", Object.keys(sequelize.models));
    console.log("Models synchronized.");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing models:", error);
    process.exit(1);
  }
};

sync();
