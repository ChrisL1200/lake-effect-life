import ItemColor from "./itemColor.model";

export default interface GroupedItem {
  id: string;
  itemColors: ItemColor[];
  type: string;
  gender: string;
}
