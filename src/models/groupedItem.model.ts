import ItemColor from "./itemColor.model";

export enum ItemType {
    TSHIRT = "T-Shirt",
    LONGSLEEVE = "Long Sleeve",
    HOODIE = "Hoodie",
    JACKET = "Jacket",
    SWEATSHIRT = "Sweatshirt",
    TANKTOP = "Tank Top"
}
export default interface GroupedItem {
    id: string;
    colors: ItemColor[];
    type: ItemType;
}
