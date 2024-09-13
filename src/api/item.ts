import Item, { ItemType } from "../models/item.model";
import { Color, ItemSize } from "../models/itemColor.model";
import items from "./itemList.json";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRandomValue = (list: any[]): any => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex]; 
}

const getPrice = () => Math.floor(Math.random() * 50) + 20;

const itemGenerator = (index: number): Item => {
    const colors = colorList.map((color: Color) => ({
        color,
        imgUrls: ['great-lakes-mens-t-shirt.jpg'],
        sizeToPriceMap: {
            [ItemSize.LARGE]: getPrice(),
            [ItemSize.MEDIUM]: getPrice(),
            [ItemSize.SMALL]: getPrice(),
            [ItemSize.XLARGE]: getPrice(),
            [ItemSize.XXLARGE]: getPrice(),
        }
    }));
    const type = getRandomValue(typeList);
    const name = `${type} ${index}`;
    const id = `${name.split(' ').join('-')}-${index}`;

    return { id, name, type, colors };
};

const ITEMS_LENGTH = 50;

const getItems = async () => {
    // const mockItems: Item[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    //console.log(JSON.stringify(mockItems));
    await new Promise((resolve) => setTimeout(resolve, 500));
    return items; 
};

export default { getItems };