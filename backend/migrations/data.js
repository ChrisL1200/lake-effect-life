'use strict';
const { v4: uuidv4 } = require('uuid'); 
// Enum values for item sizes, colors, types, and genders
const colorList = ['Blue', 'Green', 'Orange', 'Purple', 'Red', 'Yellow'];
const typeList = ['Hoodie', 'Jacket', 'Long Sleeve', 'Sweatshirt', 'Tank Top', 'T-Shirt'];
const genderList = ['Women', 'Men', 'Kids'];
const sizeList = ['S', 'M', 'L', 'XL', 'XXL'];
const imgUrlList = [
    'great-lakes-mens-t-shirt.jpg',
    'bills-t-shirt.jpg',
    'great-lakes-mens-navy-t-shirt.jpg',
    'great-lakes-mens-white-t-shirt.jpg'
];

// Helper functions to generate random values
const getRandomValue = (list) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
};

const getRandomSubarray = (arr) => {
    const newSize = Math.floor(Math.random() * arr.length) + 1;
    const arrCopy = [...arr];
    const randomItems = [];

    for (let i = 0; i < newSize; i++) {
        const randomIndex = Math.floor(Math.random() * arrCopy.length);
        randomItems.push(arrCopy[randomIndex]);
        arrCopy.splice(randomIndex, 1);
    }

    return randomItems;
};

const getRandomNumber = () => Math.floor(Math.random() * 50) + 20;

// Function to generate mock items
const itemGenerator = (index) => {
    const type = getRandomValue(typeList);
    const gender = getRandomValue(genderList);
    const id = `${gender}-${type}-${index}`;
    
    const colors = getRandomSubarray(colorList).map((color) => {
        const colorId = uuidv4();
        return {
            id: colorId,
            color,
            groupedItemId: id,
            imgUrls: getRandomSubarray(imgUrlList),
            items: getRandomSubarray(sizeList).map((size) => ({
                size, price: getRandomNumber(), inventory: getRandomNumber(), id: uuidv4(), itemColorId: colorId
            }))
        };
    });

    return { id, type, gender, colors };
};

const ITEMS_LENGTH = 50;

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const mockGroupedItems = [...Array(ITEMS_LENGTH)].map((_, index) => itemGenerator(index));

        // Insert GroupedItems into the database
        for (const groupedItem of mockGroupedItems) {
            const createdGroupedItem = await queryInterface.bulkInsert('grouped_items', [{
                id: groupedItem.id,
                type: groupedItem.type,
                gender: groupedItem.gender,
                createdAt: new Date(),
                updatedAt: new Date(),
            }], { returning: true });

            // Insert ItemColors for each GroupedItem
            for (const color of groupedItem.colors) {
                const createdColor = await queryInterface.bulkInsert('item_colors', [{
                    id: color.id,
                    groupedItemId: color.groupedItemId,
                    color: color.color,
                    imgUrls: color.imgUrls,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }], { returning: true });

                // Insert Items for each ItemColor
                for (const item of color.items) {
                    await queryInterface.bulkInsert('items', [{
                        id: item.id,
                        itemColorId: item.itemColorId,
                        size: item.size,
                        price: item.price,
                        inventory: item.inventory,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }]);
                }
            }
        }
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('items', null, {});
        await queryInterface.bulkDelete('item_colors', null, {});
        await queryInterface.bulkDelete('grouped_items', null, {});
    }
};
