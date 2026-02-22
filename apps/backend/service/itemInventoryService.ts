import { Op, Transaction } from "sequelize";
import GroupedItem from "../models/GroupedItem";
import Item from "../models/Item";
import ItemColor from "../models/ItemColor";
import InventoryLevel from "../models/InventoryLevel";
import InventoryMovement, {
  INVENTORY_MOVEMENT_TYPE_ADMIN_SET,
  InventoryMovementType,
} from "../models/InventoryMovement";

type GroupedItemWithChildren = GroupedItem & {
  itemColors?: Array<ItemColor & { items?: Item[] }>;
};

interface InventoryLevelRow {
  itemId: string;
  onHand: number;
  reserved: number;
  safetyStock: number;
}

const extractItems = (groupedItems: GroupedItem[]): Item[] => {
  const items: Item[] = [];
  for (const groupedItem of groupedItems as GroupedItemWithChildren[]) {
    for (const itemColor of groupedItem.itemColors ?? []) {
      for (const item of itemColor.items ?? []) {
        items.push(item);
      }
    }
  }

  return items;
};

const computeAvailable = (level?: InventoryLevelRow) => {
  if (!level) {
    return 0;
  }

  return Math.max(level.onHand - level.reserved - level.safetyStock, 0);
};

export const hydrateInventoryForGroupedItems = async (
  groupedItems: GroupedItem[],
): Promise<void> => {
  const items = extractItems(groupedItems);
  const itemIds = Array.from(new Set(items.map((item) => item.id)));
  if (itemIds.length === 0) {
    return;
  }

  const rows = (await InventoryLevel.findAll({
    attributes: ["itemId", "onHand", "reserved", "safetyStock"],
    where: { itemId: { [Op.in]: itemIds } },
    raw: true,
  })) as unknown as InventoryLevelRow[];

  const inventoryMap = new Map<string, number>();
  for (const row of rows) {
    inventoryMap.set(row.itemId, computeAvailable(row));
  }

  for (const item of items) {
    item.setDataValue("inventory", inventoryMap.get(item.id) ?? 0);
  }
};

export const hydrateInventoryForGroupedItem = async (
  groupedItem: GroupedItem,
): Promise<void> => {
  await hydrateInventoryForGroupedItems([groupedItem]);
};

export const setItemOnHandInventory = async (
  itemId: string,
  targetOnHand: number,
  transaction: Transaction,
  movementType: InventoryMovementType = INVENTORY_MOVEMENT_TYPE_ADMIN_SET,
  note?: string,
): Promise<void> => {
  const sanitizedTarget = Math.max(0, Math.floor(targetOnHand));

  let level = await InventoryLevel.findByPk(itemId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!level) {
    level = await InventoryLevel.create(
      {
        itemId,
        onHand: 0,
        reserved: 0,
        safetyStock: 0,
      },
      { transaction },
    );
  }

  const delta = sanitizedTarget - level.onHand;
  if (delta === 0) {
    return;
  }

  await level.update({ onHand: sanitizedTarget }, { transaction });
  await InventoryMovement.create(
    {
      itemId,
      movementType,
      quantityDelta: delta,
      note: note ?? null,
    },
    { transaction },
  );
};

export const getItemInventorySnapshot = async (itemId: string) => {
  const level = await InventoryLevel.findByPk(itemId);
  if (!level) {
    return null;
  }

  const available = Math.max(level.onHand - level.reserved - level.safetyStock, 0);
  return {
    itemId: level.itemId,
    onHand: level.onHand,
    reserved: level.reserved,
    safetyStock: level.safetyStock,
    available,
  };
};

export const setItemSafetyStock = async (
  itemId: string,
  safetyStock: number,
  transaction?: Transaction,
) => {
  const sanitized = Math.max(0, Math.floor(safetyStock));
  let level = await InventoryLevel.findByPk(itemId, { transaction });
  if (!level) {
    level = await InventoryLevel.create(
      {
        itemId,
        onHand: 0,
        reserved: 0,
        safetyStock: sanitized,
      },
      { transaction },
    );
    return level;
  }

  await level.update({ safetyStock: sanitized }, { transaction });
  return level;
};
