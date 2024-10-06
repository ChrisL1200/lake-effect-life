import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';

export enum ItemType {
    TSHIRT = "T-Shirt",
    LONGSLEEVE = "Long Sleeve",
    HOODIE = "Hoodie",
    JACKET = "Jacket",
    SWEATSHIRT = "Sweatshirt",
    TANKTOP = "Tank Top"
}

export enum ItemGender {
    MEN = "Men",
    WOMEN = "Women",
    KIDS = "Kids"
}

interface GroupedItemAttributes {
    id: string;
    type: ItemType;
    gender: ItemGender;
}

interface GroupedItemCreationAttributes extends Optional<GroupedItemAttributes, 'id'> {}

class GroupedItem extends Model<GroupedItemAttributes, GroupedItemCreationAttributes> implements GroupedItemAttributes {
    public id!: string;
    public type!: ItemType;
    public gender!: ItemGender;
}

GroupedItem.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM(...Object.values(ItemType)),
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM(...Object.values(ItemGender)),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'GroupedItem',
    tableName: 'grouped_items',
    timestamps: true,
});

export default GroupedItem;

