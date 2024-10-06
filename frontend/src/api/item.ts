import axios from "axios";
import GroupedItem, { ItemGender, ItemType } from "../models/groupedItem.model";
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

const genderList: ItemGender[] = [
    ItemGender.WOMEN,
    ItemGender.MEN,
    ItemGender.KIDS
];

const sizeList: ItemSize[] = [
    ItemSize.SMALL,
    ItemSize.MEDIUM,
    ItemSize.LARGE,
    ItemSize.XLARGE,
    ItemSize.XXLARGE
]

const imgUrlList: string[] = ['great-lakes-mens-t-shirt.jpg', 'bills-t-shirt.jpg', 'great-lakes-mens-navy-t-shirt.jpg', 'great-lakes-mens-white-t-shirt.jpg']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRandomValue = (list: any[]): any => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex]; 
}

const getRandomSubarray = (arr: any[]): any[] => {
    // Random size for the new array (between 1 and the length of the original array)
    const newSize = Math.floor(Math.random() * arr.length) + 1;

    // Create a copy of the original array to randomly pick from
    const arrCopy = [...arr];

    const randomItems: string[] = [];

    // Loop until we fill the new array with random items
    for (let i = 0; i < newSize; i++) {
        // Get a random index from the copied array
        const randomIndex = Math.floor(Math.random() * arrCopy.length);

        // Add the randomly selected item to the new array
        randomItems.push(arrCopy[randomIndex]);

        // Optionally remove the item from the array to avoid duplicates
        arrCopy.splice(randomIndex, 1);
    }

    return randomItems;
}

const getRandomNumber = () => Math.floor(Math.random() * 50) + 20;

const itemGenerator = (index: number): GroupedItem => {
    const type = getRandomValue(typeList);
    const gender = getRandomValue(genderList);
    const id = `${gender} ${type} ${index}`;
    const colors = getRandomSubarray(colorList).map((color: Color, colorIndex: number) => ({
        id: `${index}-${colorIndex}`,
        color,
        groupedItemId: id,
        imgUrls: getRandomSubarray(imgUrlList),
        items: getRandomSubarray(sizeList).map((size: ItemSize, sizeIndex: number) => ({
            size, price: getRandomNumber(), inventory: getRandomNumber(), id: `${index}-${colorIndex}-${sizeIndex}`, itemColorId: `${index}-${colorIndex}`
        }))
    }));

    return { id, type, gender, colors };
};

const ITEMS_LENGTH = 50;

const getGroupedItems = async () => {
    //const mockGroupItems: GroupedItem[] = [...Array(ITEMS_LENGTH)].map((_, index: number) => itemGenerator(index));
    //console.log(JSON.stringify(mockGroupItems));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response: AxiosResponse = await axios.get('http://localhost:3000/grouped-items');
    return response.data.data; 
};

export default { getGroupedItems };