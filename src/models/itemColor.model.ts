
export enum Color {
    BLUE = "Blue",
    RED = "Red",
    ORANGE = "Orange",
    YELLOW = "Yellow",
    GREEN = "Green",
    PURPLE = "Purple"
}

export enum ItemSize {
    SMALL = "Small",
    MEDIUM = "Medium",
    LARGE = "Large",
    XLARGE = "XL",
    XXLARGE = "XXL"
}

export default interface ItemColor {
    sizeToPriceMap: Record<ItemSize, number>;
    color: Color;
    imgUrls: string[];
}