// import { Color, ItemType, Item } from "../store/item.store.ts";
import items from "./itemList.json";

//const colorList: Color[] = [
//    Color.BLUE,
//    Color.GREEN,
//    Color.ORANGE,
//    Color.PURPLE,
//    Color.RED,
//    Color.YELLOW
//];

//const typeList: ItemType[] = [
//    ItemType.HOODIE,
//    ItemType.JACKET,
//    ItemType.LONGSLEEVE,
//    ItemType.SWEATSHIRT,
//    ItemType.TANKTOP,
//    ItemType.TSHIRT
//];

//// eslint-disable-next-line @typescript-eslint/no-explicit-any
//const getRandomValue = (list: any[]): any => {
//    const randomIndex = Math.floor(Math.random() * list.length);
//    return list[randomIndex]; 
//}

//const itemGenerator = (index: number): Item => {
//    const colors = [getRandomValue(colorList)];
//    const type = getRandomValue(typeList);
//    const name = `${colors[0]} ${type}`;
//    const id = `${name.split(' ').join('-')}-${index}`;
//    const imgUrls = ['great-lakes-mens-t-shirt.jpg'];

//    return { id, name, type, colors, imgUrls };
//};

//const ITEMS_LENGTH = 50;

const getItems = async () => {
    // const items: Item[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    await new Promise((resolve) => setTimeout(resolve, 500));
    return items; 
};

export default { getItems };