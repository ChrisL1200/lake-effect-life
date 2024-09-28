import Item from "./item.model";

export enum Color {
    BLUE = "Blue",
    RED = "Red",
    ORANGE = "Orange",
    YELLOW = "Yellow",
    GREEN = "Green",
    PURPLE = "Purple"
}

export default interface ItemColor {
    id: string;
    groupedItemId?: string;
    color: Color;
    imgUrls: string[];
    items: Item[];
}
