// scripts/sync.ts
import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../models';
import GroupedItem from '../models/GroupedItem';
import ItemColor from '../models/ItemColor';
import Item from '../models/Item';
// Import other models if necessary

const sync = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await GroupedItem.sync({ force: true });
        await ItemColor.sync({ force: true });
        await Item.sync({ force: true });
        console.log('Registered models:', Object.keys(sequelize.models));
        console.log('Models synchronized.');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing models:', error);
        process.exit(1);
    }
};

sync();
