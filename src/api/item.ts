import { Color, ItemType, Item } from "../store/item.store.ts";
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

const itemGenerator = (index: number): Item => {
    const colors = colorList;
    const type = getRandomValue(typeList);
    const name = `${type} ${index}`;
    const id = `${name.split(' ').join('-')}-${index}`;
    const imgUrls = ['great-lakes-mens-t-shirt.jpg'];
    const price = Math.floor(Math.random() * 50) + 20;

    return { id, name, type, colors, imgUrls, price };
};

const ITEMS_LENGTH = 50;

const getItems = async () => {
    const mockItems: Item[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    // console.log(JSON.stringify(mockItems));
    await new Promise((resolve) => setTimeout(resolve, 500));
    return items; 
};

export default { getItems };