import sequelize from "../models";
import { Op } from "sequelize";
import InventoryLevel from "../models/InventoryLevel";
import InventoryMovement, {
  INVENTORY_MOVEMENT_TYPE_RELEASE,
  INVENTORY_MOVEMENT_TYPE_RESERVE,
  INVENTORY_MOVEMENT_TYPE_SALE,
} from "../models/InventoryMovement";
import InventoryReservation, {
  INVENTORY_RESERVATION_STATUS_ACTIVE,
  INVENTORY_RESERVATION_STATUS_CONVERTED,
  INVENTORY_RESERVATION_STATUS_EXPIRED,
  INVENTORY_RESERVATION_STATUS_RELEASED,
} from "../models/InventoryReservation";

const getNow = () => new Date();

const releaseExpiredReservationsInternal = async () => {
  const now = getNow();
  const expiredReservations = await InventoryReservation.findAll({
    where: {
      status: INVENTORY_RESERVATION_STATUS_ACTIVE,
      expiresAt: { [Op.lte]: now },
    },
  });

  if (expiredReservations.length === 0) {
    return 0;
  }

  await sequelize.transaction(async (transaction) => {
    for (const reservation of expiredReservations) {
      const level = await InventoryLevel.findByPk(reservation.itemId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!level) {
        await reservation.update(
          { status: INVENTORY_RESERVATION_STATUS_EXPIRED },
          { transaction },
        );
        continue;
      }

      const nextReserved = Math.max(level.reserved - reservation.quantity, 0);
      await level.update({ reserved: nextReserved }, { transaction });
      await reservation.update(
        { status: INVENTORY_RESERVATION_STATUS_EXPIRED },
        { transaction },
      );
      await InventoryMovement.create(
        {
          itemId: reservation.itemId,
          movementType: INVENTORY_MOVEMENT_TYPE_RELEASE,
          quantityDelta: reservation.quantity,
          note: "Reservation expired",
        },
        { transaction },
      );
    }
  });

  return expiredReservations.length;
};

export const releaseExpiredReservations = async () => {
  return releaseExpiredReservationsInternal();
};

interface CreateReservationInput {
  itemId: string;
  quantity: number;
  expiresAt?: Date | null;
  orderId?: string | null;
}

export const createInventoryReservation = async (
  input: CreateReservationInput,
) => {
  await releaseExpiredReservationsInternal();

  return sequelize.transaction(async (transaction) => {
    const level = await InventoryLevel.findByPk(input.itemId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!level) {
      throw new Error("Inventory level not found for item");
    }

    const available = Math.max(level.onHand - level.reserved - level.safetyStock, 0);
    if (available < input.quantity) {
      throw new Error("Insufficient available inventory");
    }

    await level.update({ reserved: level.reserved + input.quantity }, { transaction });

    const reservation = await InventoryReservation.create(
      {
        itemId: input.itemId,
        quantity: input.quantity,
        status: INVENTORY_RESERVATION_STATUS_ACTIVE,
        expiresAt: input.expiresAt ?? null,
        orderId: input.orderId ?? null,
      },
      { transaction },
    );

    await InventoryMovement.create(
      {
        itemId: input.itemId,
        movementType: INVENTORY_MOVEMENT_TYPE_RESERVE,
        quantityDelta: -input.quantity,
        note: `Reservation created: ${reservation.id}`,
      },
      { transaction },
    );

    return reservation;
  });
};

export const releaseInventoryReservation = async (reservationId: string) => {
  await releaseExpiredReservationsInternal();

  return sequelize.transaction(async (transaction) => {
    const reservation = await InventoryReservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== INVENTORY_RESERVATION_STATUS_ACTIVE) {
      return reservation;
    }

    const level = await InventoryLevel.findByPk(reservation.itemId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!level) {
      throw new Error("Inventory level not found for item");
    }

    const nextReserved = Math.max(level.reserved - reservation.quantity, 0);
    await level.update({ reserved: nextReserved }, { transaction });
    await reservation.update(
      { status: INVENTORY_RESERVATION_STATUS_RELEASED },
      { transaction },
    );

    await InventoryMovement.create(
      {
        itemId: reservation.itemId,
        movementType: INVENTORY_MOVEMENT_TYPE_RELEASE,
        quantityDelta: reservation.quantity,
        note: `Reservation released: ${reservation.id}`,
      },
      { transaction },
    );

    return reservation;
  });
};

export const convertReservationToSale = async (
  reservationId: string,
  orderId?: string,
) => {
  await releaseExpiredReservationsInternal();

  return sequelize.transaction(async (transaction) => {
    const reservation = await InventoryReservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (reservation.status !== INVENTORY_RESERVATION_STATUS_ACTIVE) {
      return reservation;
    }

    const level = await InventoryLevel.findByPk(reservation.itemId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!level) {
      throw new Error("Inventory level not found for item");
    }

    if (level.reserved < reservation.quantity) {
      throw new Error("Reserved inventory underflow");
    }
    if (level.onHand < reservation.quantity) {
      throw new Error("On-hand inventory underflow");
    }

    await level.update(
      {
        reserved: level.reserved - reservation.quantity,
        onHand: level.onHand - reservation.quantity,
      },
      { transaction },
    );
    await reservation.update(
      {
        status: INVENTORY_RESERVATION_STATUS_CONVERTED,
        orderId: orderId ?? reservation.orderId ?? null,
      },
      { transaction },
    );

    await InventoryMovement.create(
      {
        itemId: reservation.itemId,
        movementType: INVENTORY_MOVEMENT_TYPE_SALE,
        quantityDelta: -reservation.quantity,
        note: `Reservation converted to sale: ${reservation.id}`,
      },
      { transaction },
    );

    return reservation;
  });
};
