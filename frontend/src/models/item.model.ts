export enum ItemSize {
    SMALL = "S",
    MEDIUM = "M",
    LARGE = "L",
    XLARGE = "XL",
    XXLARGE = "XXL"
}

export default interface Item {
    itemColorId?: string;
    price: number;
    size: ItemSize;
    inventory: number;
    id: string;
}