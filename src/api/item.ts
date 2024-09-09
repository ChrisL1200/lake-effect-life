import { Color, ItemType, Item } from "../store/item.store.ts";

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
    const color = getRandomValue(colorList);
    const type = getRandomValue(typeList);
    const name = `${color} ${type}`;
    const id = `${name.split(' ').join('-')}-${index}`;

    return { id, name, type, color };
};

const ITEMS_LENGTH = 50;

const getItems = async () => {
    const items: Item[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    await new Promise((resolve) => setTimeout(resolve, 500));
    return items; 
};

export default { getItems };