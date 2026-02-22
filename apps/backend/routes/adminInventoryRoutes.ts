import { Request, Response, Router } from "express";
import { Op, QueryTypes, cast, col, where } from "sequelize";
import GroupedItem from "../models/GroupedItem";
import ItemColor from "../models/ItemColor";
import Item from "../models/Item";
import sequelize from "../models";
import { requireAdmin } from "../middleware/adminAuth";
import multer from "multer";
import { uploadImage } from "../service/s3Service";
import { getInventoryLookupSets } from "../service/inventoryLookupService";
import {
  hydrateInventoryForGroupedItem,
  hydrateInventoryForGroupedItems,
  setItemOnHandInventory,
} from "../service/itemInventoryService";

interface AdminItemPayload {
  id?: string;
  size: string;
  price: number;
  inventory: number;
}

interface AdminItemColorPayload {
  id?: string;
  color: string;
  imgUrls: string[];
  items: AdminItemPayload[];
}

interface AdminGroupedItemPayload {
  id: string;
  type: string;
  gender: string;
  itemColors: AdminItemColorPayload[];
}

const includeConfig = [
  {
    model: ItemColor,
    as: "itemColors",
    include: [{ model: Item, as: "items" }],
  },
];

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const getRouteId = (req: Request) =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

const parseInventoryPayload = async (
  body: any,
): Promise<AdminGroupedItemPayload | null> => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const lookupSets = await getInventoryLookupSets();
  const { id, type, gender, itemColors } = body;

  if (
    typeof id !== "string" ||
    !id.trim() ||
    typeof type !== "string" ||
    !lookupSets.types.has(type) ||
    typeof gender !== "string" ||
    !lookupSets.genders.has(gender) ||
    !Array.isArray(itemColors) ||
    itemColors.length === 0
  ) {
    return null;
  }

  const parsedColors: AdminItemColorPayload[] = [];

  for (const colorPayload of itemColors) {
    if (
      !colorPayload ||
      typeof colorPayload !== "object" ||
      typeof colorPayload.color !== "string" ||
      !lookupSets.colors.has(colorPayload.color) ||
      !Array.isArray(colorPayload.imgUrls) ||
      !Array.isArray(colorPayload.items) ||
      colorPayload.items.length === 0
    ) {
      return null;
    }

    const parsedItems: AdminItemPayload[] = [];
    for (const itemPayload of colorPayload.items) {
      const price = Number(itemPayload?.price);
      const inventory = Number(itemPayload?.inventory);

      if (
        !itemPayload ||
        typeof itemPayload !== "object" ||
        typeof itemPayload.size !== "string" ||
        !lookupSets.sizes.has(itemPayload.size) ||
        Number.isNaN(price) ||
        price < 0 ||
        Number.isNaN(inventory) ||
        inventory < 0
      ) {
        return null;
      }

      parsedItems.push({
        id:
          typeof itemPayload.id === "string" && itemPayload.id.trim()
            ? itemPayload.id
            : undefined,
        size: itemPayload.size,
        price,
        inventory,
      });
    }

    parsedColors.push({
      id:
        typeof colorPayload.id === "string" && colorPayload.id.trim()
          ? colorPayload.id
          : undefined,
      color: colorPayload.color,
      imgUrls: colorPayload.imgUrls.filter(
        (imgUrl: unknown) => typeof imgUrl === "string",
      ),
      items: parsedItems,
    });
  }

  return {
    id,
    type,
    gender,
    itemColors: parsedColors,
  };
};

const loadGroupedItem = async (id: string) =>
  GroupedItem.findByPk(id, { include: includeConfig });

const parseInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

router.get("/", requireAdmin, async (req: Request, res: Response) => {
  const page = parseInteger(req.query.page, 1);
  const limit = Math.min(parseInteger(req.query.limit, 25), 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sortByRaw =
    typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
  const sortDirectionRaw =
    typeof req.query.sortDirection === "string"
      ? req.query.sortDirection.toUpperCase()
      : "DESC";

  const allowedSortFields = ["id", "type", "gender", "createdAt", "updatedAt"];
  const sortBy = allowedSortFields.includes(sortByRaw) ? sortByRaw : "createdAt";
  const sortDirection = sortDirectionRaw === "ASC" ? "ASC" : "DESC";

  const whereClause: any = {};
  if (search) {
    whereClause[Op.or] = [
      { id: { [Op.iLike]: `%${search}%` } },
      where(cast(col("GroupedItem.type"), "text"), {
        [Op.iLike]: `%${search}%`,
      }),
      where(cast(col("GroupedItem.gender"), "text"), {
        [Op.iLike]: `%${search}%`,
      }),
    ];
  }

  try {
    const groupedItems = await GroupedItem.findAndCountAll({
      where: whereClause,
      include: includeConfig,
      distinct: true,
      offset: (page - 1) * limit,
      limit,
      order: [[sortBy, sortDirection]],
    });
    await hydrateInventoryForGroupedItems(groupedItems.rows);

    return res.status(200).json({
      data: groupedItems.rows,
      total: groupedItems.count,
      page,
      pageSize: limit,
      totalPages: Math.ceil(groupedItems.count / limit),
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/transactions", requireAdmin, async (req: Request, res: Response) => {
  const page = parseInteger(req.query.page, 1);
  const limit = Math.min(parseInteger(req.query.limit, 25), 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sortByRaw =
    typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
  const sortDirectionRaw =
    typeof req.query.sortDirection === "string"
      ? req.query.sortDirection.toUpperCase()
      : "DESC";

  const sortFieldMap: Record<string, string> = {
    id: "im.id",
    itemId: 'im."itemId"',
    movementType: 'im."movementType"',
    quantityDelta: 'im."quantityDelta"',
    createdAt: 'im."createdAt"',
    customerEmail: "c.email",
    orderNumber: 'o."orderNumber"',
    shipmentStatus: "sp.status",
  };
  const sortBy = Object.keys(sortFieldMap).includes(sortByRaw)
    ? sortByRaw
    : "createdAt";
  const sortDirection = sortDirectionRaw === "ASC" ? "ASC" : "DESC";
  const searchValue = search ? `%${search}%` : null;
  const searchClause = search
    ? `
      WHERE (
        im.id::text ILIKE :search
        OR im."itemId"::text ILIKE :search
        OR im."movementType"::text ILIKE :search
        OR COALESCE(im.note, '') ILIKE :search
        OR COALESCE(o."orderNumber", '') ILIKE :search
        OR COALESCE(c.email, '') ILIKE :search
        OR COALESCE(c."firstName", '') ILIKE :search
        OR COALESCE(c."lastName", '') ILIKE :search
        OR COALESCE(a.line1, '') ILIKE :search
        OR COALESCE(a.city, '') ILIKE :search
        OR COALESCE(a.state, '') ILIKE :search
        OR COALESCE(sp.status, '') ILIKE :search
        OR COALESCE(sp."trackingNumber", '') ILIKE :search
      )
    `
    : "";

  try {
    const rows = (await sequelize.query(
      `
        SELECT
          im.id,
          im."itemId",
          im."orderId",
          im."movementType",
          im."quantityDelta",
          im.note,
          im."createdAt",
          im."updatedAt",
          o."orderNumber",
          o.status AS "orderStatus",
          c.id AS "customerId",
          c.email AS "customerEmail",
          c."firstName" AS "customerFirstName",
          c."lastName" AS "customerLastName",
          c."isGuest" AS "customerIsGuest",
          a.line1 AS "shippingLine1",
          a.city AS "shippingCity",
          a.state AS "shippingState",
          a."postalCode" AS "shippingPostalCode",
          a.country AS "shippingCountry",
          sp.status AS "shipmentStatus",
          sp."trackingNumber" AS "trackingNumber",
          sp."shippedAt" AS "shippedAt",
          sp."deliveredAt" AS "deliveredAt"
        FROM inventory_movements im
        LEFT JOIN orders o ON o.id = im."orderId"
        LEFT JOIN customers c ON c.id = o."customerId"
        LEFT JOIN addresses a ON a.id = o."shippingAddressId"
        LEFT JOIN LATERAL (
          SELECT s.status, s."trackingNumber", s."shippedAt", s."deliveredAt", s."createdAt"
          FROM shipments s
          WHERE s."orderId" = o.id
          ORDER BY s."createdAt" DESC
          LIMIT 1
        ) sp ON TRUE
        ${searchClause}
        ORDER BY ${sortFieldMap[sortBy]} ${sortDirection}
        LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          search: searchValue,
          limit,
          offset: (page - 1) * limit,
        },
        type: QueryTypes.SELECT,
      },
    )) as any[];

    const countResult = (await sequelize.query(
      `
        SELECT COUNT(*)::int AS total
        FROM inventory_movements im
        LEFT JOIN orders o ON o.id = im."orderId"
        LEFT JOIN customers c ON c.id = o."customerId"
        LEFT JOIN addresses a ON a.id = o."shippingAddressId"
        LEFT JOIN LATERAL (
          SELECT s.status, s."trackingNumber"
          FROM shipments s
          WHERE s."orderId" = o.id
          ORDER BY s."createdAt" DESC
          LIMIT 1
        ) sp ON TRUE
        ${searchClause}
      `,
      {
        replacements: { search: searchValue },
        type: QueryTypes.SELECT,
      },
    )) as Array<{ total: number }>;

    const total = Number(countResult[0]?.total || 0);

    return res.status(200).json({
      data: rows,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/:id", requireAdmin, async (req: Request, res: Response) => {
  const routeId = getRouteId(req);
  try {
    const item = await loadGroupedItem(routeId);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    await hydrateInventoryForGroupedItem(item);

    return res.status(200).json({ data: item });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post(
  "/upload-image",
  requireAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "Missing image file" });
    }

    try {
      const imageUrl = await uploadImage(req.file);
      return res.status(200).json({ imageUrl });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
);

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const payload = await parseInventoryPayload(req.body);
  if (!payload) {
    return res.status(400).json({ message: "Invalid inventory payload" });
  }

  try {
    const existing = await GroupedItem.findByPk(payload.id);
    if (existing) {
      return res.status(409).json({ message: "Inventory item already exists" });
    }

    await sequelize.transaction(async (transaction) => {
      await GroupedItem.create(
        {
          id: payload.id,
          type: payload.type,
          gender: payload.gender,
        },
        { transaction },
      );

      for (const colorPayload of payload.itemColors) {
        const itemColor = await ItemColor.create(
          {
            id: colorPayload.id,
            color: colorPayload.color,
            groupedItemId: payload.id,
            imgUrls: colorPayload.imgUrls,
          },
          { transaction },
        );

        for (const itemPayload of colorPayload.items) {
          const item = await Item.create(
            {
              id: itemPayload.id,
              itemColorId: itemColor.id,
              size: itemPayload.size,
              price: itemPayload.price,
              inventory: itemPayload.inventory,
            },
            { transaction },
          );
          await setItemOnHandInventory(
            item.id,
            itemPayload.inventory,
            transaction,
            undefined,
            "Admin create inventory set",
          );
        }
      }
    });

    const created = await loadGroupedItem(payload.id);
    if (created) {
      await hydrateInventoryForGroupedItem(created);
    }
    return res.status(201).json({ data: created });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  const routeId = getRouteId(req);
  const payload = await parseInventoryPayload({ ...req.body, id: routeId });
  if (!payload) {
    return res.status(400).json({ message: "Invalid inventory payload" });
  }
  const targetId = typeof req.body?.id === "string" ? req.body.id.trim() : routeId;

  try {
    const existing = await GroupedItem.findByPk(routeId);
    if (!existing) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    if (targetId !== routeId) {
      const idConflict = await GroupedItem.findByPk(targetId);
      if (idConflict) {
        return res.status(409).json({ message: "Inventory item id already exists" });
      }
    }

    await sequelize.transaction(async (transaction) => {
      const existingColors = await ItemColor.findAll({
        where: { groupedItemId: routeId },
        attributes: ["id"],
        transaction,
      });

      const colorIds = existingColors.map((color) => color.id);
      if (colorIds.length > 0) {
        await Item.destroy({
          where: { itemColorId: { [Op.in]: colorIds } },
          transaction,
        });
      }

      await ItemColor.destroy({
        where: { groupedItemId: routeId },
        transaction,
      });

      if (targetId !== routeId) {
        await GroupedItem.destroy({
          where: { id: routeId },
          transaction,
        });
        await GroupedItem.create(
          {
            id: targetId,
            type: payload.type,
            gender: payload.gender,
          },
          { transaction },
        );
      } else {
        await existing.update(
          {
            type: payload.type,
            gender: payload.gender,
          },
          { transaction },
        );
      }

      for (const colorPayload of payload.itemColors) {
        const itemColor = await ItemColor.create(
          {
            id: colorPayload.id,
            color: colorPayload.color,
            groupedItemId: targetId,
            imgUrls: colorPayload.imgUrls,
          },
          { transaction },
        );

        for (const itemPayload of colorPayload.items) {
          const item = await Item.create(
            {
              id: itemPayload.id,
              itemColorId: itemColor.id,
              size: itemPayload.size,
              price: itemPayload.price,
              inventory: itemPayload.inventory,
            },
            { transaction },
          );
          await setItemOnHandInventory(
            item.id,
            itemPayload.inventory,
            transaction,
            undefined,
            "Admin update inventory set",
          );
        }
      }
    });

    const updated = await loadGroupedItem(targetId);
    if (updated) {
      await hydrateInventoryForGroupedItem(updated);
    }
    return res.status(200).json({ data: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const routeId = getRouteId(req);
  try {
    const existing = await GroupedItem.findByPk(routeId);
    if (!existing) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await sequelize.transaction(async (transaction) => {
      const existingColors = await ItemColor.findAll({
        where: { groupedItemId: routeId },
        attributes: ["id"],
        transaction,
      });
      const colorIds = existingColors.map((color) => color.id);

      if (colorIds.length > 0) {
        await Item.destroy({
          where: { itemColorId: { [Op.in]: colorIds } },
          transaction,
        });
      }

      await ItemColor.destroy({
        where: { groupedItemId: routeId },
        transaction,
      });

      await GroupedItem.destroy({
        where: { id: routeId },
        transaction,
      });
    });

    return res.status(200).json({ message: "Inventory item deleted" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
