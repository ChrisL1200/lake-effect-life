import { Request, Response, Router } from "express";
import { requireAdmin } from "../middleware/adminAuth";
import sequelize from "../models";
import {
  getItemInventorySnapshot,
  setItemOnHandInventory,
  setItemSafetyStock,
} from "../service/itemInventoryService";
import {
  convertReservationToSale,
  createInventoryReservation,
  releaseExpiredReservations,
  releaseInventoryReservation,
} from "../service/inventoryReservationService";

const router = Router();

const routeParam = (value: unknown) =>
  Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");

router.get("/levels/:itemId", requireAdmin, async (req: Request, res: Response) => {
  const itemId = routeParam(req.params.itemId).trim();
  if (!itemId) {
    return res.status(400).json({ message: "Missing itemId" });
  }

  try {
    const snapshot = await getItemInventorySnapshot(itemId);
    if (!snapshot) {
      return res.status(404).json({ message: "Inventory level not found" });
    }
    return res.status(200).json({ data: snapshot });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.patch("/levels/:itemId", requireAdmin, async (req: Request, res: Response) => {
  const itemId = routeParam(req.params.itemId).trim();
  if (!itemId) {
    return res.status(400).json({ message: "Missing itemId" });
  }

  const nextOnHand =
    req.body?.onHand === undefined ? undefined : Number(req.body?.onHand);
  const nextSafetyStock =
    req.body?.safetyStock === undefined ? undefined : Number(req.body?.safetyStock);

  if (
    nextOnHand !== undefined &&
    (!Number.isInteger(nextOnHand) || nextOnHand < 0)
  ) {
    return res.status(400).json({ message: "onHand must be a non-negative integer" });
  }
  if (
    nextSafetyStock !== undefined &&
    (!Number.isInteger(nextSafetyStock) || nextSafetyStock < 0)
  ) {
    return res.status(400).json({ message: "safetyStock must be a non-negative integer" });
  }
  if (nextOnHand === undefined && nextSafetyStock === undefined) {
    return res.status(400).json({ message: "Provide onHand and/or safetyStock" });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      if (nextOnHand !== undefined) {
        await setItemOnHandInventory(
          itemId,
          nextOnHand,
          transaction,
          undefined,
          "Admin level patch",
        );
      }
      if (nextSafetyStock !== undefined) {
        await setItemSafetyStock(itemId, nextSafetyStock, transaction);
      }
    });

    const snapshot = await getItemInventorySnapshot(itemId);
    if (!snapshot) {
      return res.status(404).json({ message: "Inventory level not found" });
    }
    return res.status(200).json({ data: snapshot });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/reservations", async (req: Request, res: Response) => {
  const itemId = typeof req.body?.itemId === "string" ? req.body.itemId.trim() : "";
  const quantity = Number(req.body?.quantity);
  const ttlMinutes =
    req.body?.ttlMinutes === undefined ? 15 : Number(req.body?.ttlMinutes);
  const orderId =
    typeof req.body?.orderId === "string" ? req.body.orderId.trim() : undefined;

  if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "itemId and positive integer quantity are required" });
  }
  if (!Number.isInteger(ttlMinutes) || ttlMinutes <= 0) {
    return res.status(400).json({ message: "ttlMinutes must be a positive integer" });
  }

  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  try {
    const reservation = await createInventoryReservation({
      itemId,
      quantity,
      expiresAt,
      orderId,
    });
    return res.status(201).json({ data: reservation });
  } catch (error: any) {
    if (error.message === "Insufficient available inventory") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.post("/reservations/:id/release", async (req: Request, res: Response) => {
  const reservationId = routeParam(req.params.id).trim();
  if (!reservationId) {
    return res.status(400).json({ message: "Missing reservation id" });
  }

  try {
    const reservation = await releaseInventoryReservation(reservationId);
    return res.status(200).json({ data: reservation });
  } catch (error: any) {
    if (error.message === "Reservation not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.post("/reservations/:id/convert", async (req: Request, res: Response) => {
  const reservationId = routeParam(req.params.id).trim();
  const orderId =
    typeof req.body?.orderId === "string" ? req.body.orderId.trim() : undefined;
  if (!reservationId) {
    return res.status(400).json({ message: "Missing reservation id" });
  }

  try {
    const reservation = await convertReservationToSale(reservationId, orderId);
    return res.status(200).json({ data: reservation });
  } catch (error: any) {
    if (error.message === "Reservation not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

router.post(
  "/reservations/release-expired",
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const releasedCount = await releaseExpiredReservations();
      return res.status(200).json({ releasedCount });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
);

export default router;
