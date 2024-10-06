import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import ItemColor from './ItemColor';

export enum ItemSize {
    SMALL = "S",
    MEDIUM = "M",
    LARGE = "L",
    XLARGE = "XL",
    XXLARGE = "XXL"
}

interface ItemAttributes {
    id: string;
    price: number;
    size: ItemSize;
    inventory: number;
    itemColorId?: string;
}

interface ItemCreationAttributes extends Optional<ItemAttributes, 'id'> {}

class Item extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
    public id!: string;
    public price!: number;
    public size!: ItemSize;
    public inventory!: number;
    public itemColorId?: string;
}

Item.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    size: {
        type: DataTypes.ENUM(...Object.values(ItemSize)),
        allowNull: false,
    },
    inventory: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    itemColorId: {
        type: DataTypes.UUID,
        references: {
            model: ItemColor,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
    timestamps: true,
});

// Associations
ItemColor.hasMany(Item, { foreignKey: 'itemColorId' });
Item.belongsTo(ItemColor, { foreignKey: 'itemColorId' });

export default Item;

