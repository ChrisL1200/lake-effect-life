import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import GroupedItem from './GroupedItem';

export enum Color {
    BLUE = "Blue",
    RED = "Red",
    ORANGE = "Orange",
    YELLOW = "Yellow",
    GREEN = "Green",
    PURPLE = "Purple"
}

interface ItemColorAttributes {
    id: string;
    color: Color;
    groupedItemId?: string;
    imgUrls: string[];
}

interface ItemColorCreationAttributes extends Optional<ItemColorAttributes, 'id'> {}

class ItemColor extends Model<ItemColorAttributes, ItemColorCreationAttributes> implements ItemColorAttributes {
    public id!: string;
    public color!: Color;
    public groupedItemId?: string;
    public imgUrls!: string[];
}

ItemColor.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    color: {
        type: DataTypes.ENUM(...Object.values(Color)),
        allowNull: false,
    },
    groupedItemId: {
        type: DataTypes.STRING,
        references: {
            model: GroupedItem,
            key: 'id',
        },
    },
    imgUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'ItemColor',
    tableName: 'item_colors',
    timestamps: true,
});

// Associations
GroupedItem.hasMany(ItemColor, { foreignKey: 'groupedItemId' });
ItemColor.belongsTo(GroupedItem, { foreignKey: 'groupedItemId' });

export default ItemColor;

