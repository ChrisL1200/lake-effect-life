import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import GroupedItem from './GroupedItem';
import User from './User'; // You need to define a User model or use Cognito user attributes

interface CartAttributes {
    id: string;
    userId: string;
    groupedItemId: string;
    quantity: number;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
    public id!: string;
    public userId!: string;
    public groupedItemId!: string;
    public quantity!: number;
}

Cart.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: { model: User, key: 'id' }, // Define User model accordingly
    },
    groupedItemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: GroupedItem,
            key: 'id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
});

// Associations
// Define associations with User and GroupedItem as needed

export default Cart;

