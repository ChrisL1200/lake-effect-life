import ItemColor from "./itemColor.model";

export enum ItemType {
    TSHIRT = "T-Shirt",
    LONGSLEEVE = "Long Sleeve",
    HOODIE = "Hoodie",
    JACKET = "Jacket",
    SWEATSHIRT = "Sweatshirt",
    TANKTOP = "Tank Top"
}
export default interface Item {
    id: string;
    name: string;
    colors: ItemColor[];
    type: ItemType;
}