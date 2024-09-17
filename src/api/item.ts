import GroupedItem, { ItemType } from "../models/groupedItem.model";
// import { ItemSize } from "../models/item.model";
import { Color } from "../models/itemColor.model";
import items from "./inventory.json";

enum ItemSize {
    SMALL = "S",
    MEDIUM = "M",
    LARGE = "L",
    XLARGE = "XL",
    XXLARGE = "XXL"
}

const colorList: Color[] = [
    Color.BLUE,
    Color.GREEN,
    Color.ORANGE,
    Color.PURPLE,
    Color.RED,
    Color.YELLOW
];

const typeList: ItemType[] = [
    ItemType.HOODIE,
    ItemType.JACKET,
    ItemType.LONGSLEEVE,
    ItemType.SWEATSHIRT,
    ItemType.TANKTOP,
    ItemType.TSHIRT
];

const sizeList: ItemSize[] = [
    ItemSize.SMALL,
    ItemSize.MEDIUM,
    ItemSize.LARGE,
    ItemSize.XLARGE,
    ItemSize.XXLARGE
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRandomValue = (list: any[]): any => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex]; 
}

const getRandomNumber = () => Math.floor(Math.random() * 50) + 20;

const itemGenerator = (index: number): GroupedItem => {
    const colors = colorList.map((color: Color, colorIndex: number) => ({
        id: `${index}-${colorIndex}`,
        color,
        imgUrls: ['great-lakes-mens-t-shirt.jpg'],
        items: sizeList.map((size: ItemSize, sizeIndex: number) => ({
            size, price: getRandomNumber(), inventory: getRandomNumber(), id: `${index}-${colorIndex}-${sizeIndex}`
        }))
    }));
    const type = getRandomValue(typeList);
    const id = `${type} ${index}`;

    return { id, type, colors };
};

const ITEMS_LENGTH = 50;

const getGroupedItems = async () => {
    //const mockGroupItems: GroupedItem[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    //console.log(JSON.stringify(mockGroupItems));
    await new Promise((resolve) => setTimeout(resolve, 500));
    return items; 
};

export default { getGroupedItems };