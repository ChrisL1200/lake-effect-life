import Item from "./item.model";

export default interface ItemColor {
  id: string;
  groupedItemId?: string;
  color: string;
  imgUrls: string[];
  items: Item[];
}
