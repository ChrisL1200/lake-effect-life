import { Request, Response, Router } from "express";
import { requireAdmin } from "../middleware/adminAuth";
import GroupedItem from "../models/GroupedItem";
import ItemColor from "../models/ItemColor";
import Item from "../models/Item";
import {
  ColorLookup,
  ItemGenderLookup,
  ItemSizeLookup,
  ItemTypeLookup,
} from "../models/InventoryLookups";
import { getInventoryLookups } from "../service/inventoryLookupService";

type LookupCategory = "types" | "genders" | "colors" | "sizes";

interface LookupCategoryConfig {
  model:
    | typeof ItemTypeLookup
    | typeof ItemGenderLookup
    | typeof ColorLookup
    | typeof ItemSizeLookup;
  usageCount: (value: string) => Promise<number>;
}

const CATEGORY_CONFIG: Record<LookupCategory, LookupCategoryConfig> = {
  types: {
    model: ItemTypeLookup,
    usageCount: (value: string) => GroupedItem.count({ where: { type: value } }),
  },
  genders: {
    model: ItemGenderLookup,
    usageCount: (value: string) => GroupedItem.count({ where: { gender: value } }),
  },
  colors: {
    model: ColorLookup,
    usageCount: (value: string) => ItemColor.count({ where: { color: value } }),
  },
  sizes: {
    model: ItemSizeLookup,
    usageCount: (value: string) => Item.count({ where: { size: value } }),
  },
};

const isLookupCategory = (value: string): value is LookupCategory =>
  value in CATEGORY_CONFIG;

const router = Router();

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const lookups = await getInventoryLookups();
    return res.status(200).json(lookups);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/:category", requireAdmin, async (req: Request, res: Response) => {
  const category = Array.isArray(req.params.category)
    ? req.params.category[0]
    : req.params.category;
  if (!isLookupCategory(category)) {
    return res.status(400).json({ message: "Invalid lookup category" });
  }

  const value = typeof req.body?.value === "string" ? req.body.value.trim() : "";
  if (!value) {
    return res.status(400).json({ message: "Lookup value is required" });
  }

  try {
    const config = CATEGORY_CONFIG[category];
    await config.model.findOrCreate({ where: { value }, defaults: { value } });
    const lookups = await getInventoryLookups();
    return res.status(201).json(lookups);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete(
  "/:category/:value",
  requireAdmin,
  async (req: Request, res: Response) => {
    const category = Array.isArray(req.params.category)
      ? req.params.category[0]
      : req.params.category;
    if (!isLookupCategory(category)) {
      return res.status(400).json({ message: "Invalid lookup category" });
    }

    const valueParam = Array.isArray(req.params.value)
      ? req.params.value[0]
      : req.params.value;
    const value = typeof valueParam === "string" ? decodeURIComponent(valueParam).trim() : "";
    if (!value) {
      return res.status(400).json({ message: "Lookup value is required" });
    }

    try {
      const config = CATEGORY_CONFIG[category];
      const existing = await config.model.findByPk(value);
      if (!existing) {
        return res.status(404).json({ message: "Lookup value not found" });
      }

      const usageCount = await config.usageCount(value);
      if (usageCount > 0) {
        return res.status(409).json({
          message: "Cannot delete lookup value because it is used by inventory",
        });
      }

      const total = await config.model.count();
      if (total <= 1) {
        return res.status(409).json({
          message: "Cannot delete the last remaining value in a lookup category",
        });
      }

      await existing.destroy();
      const lookups = await getInventoryLookups();
      return res.status(200).json(lookups);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
);

export default router;
