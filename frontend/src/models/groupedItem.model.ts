import ItemColor from "./itemColor.model";

export enum ItemType {
    TSHIRT = "T-Shirt",
    LONGSLEEVE = "Long Sleeve",
    HOODIE = "Hoodie",
    JACKET = "Jacket",
    SWEATSHIRT = "Sweatshirt",
    TANKTOP = "Tank Top"
}

export enum ItemGender {
    MEN = "Men",
    WOMEN = "Women",
    KIDS = "Kids"
}
export default interface GroupedItem {
    id: string;
    itemColors: ItemColor[];
    type: ItemType;
    gender: ItemGender;
}
