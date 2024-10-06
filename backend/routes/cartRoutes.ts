import { Router, Request, Response } from 'express';
import Cart from '../models/Cart';
import GroupedItem from '../models/GroupedItem';

const router = Router();

// Middleware to authenticate user using Cognito tokens can be added here

// Add item to cart
//router.post('/', async (req: Request, res: Response) => {
//    const { userId, groupedItemId, quantity } = req.body;
//    try {
//        const groupedItem = await GroupedItem.findByPk(groupedItemId);
//        if (!groupedItem) return res.status(404).json({ message: 'GroupedItem not found' });

//        const cartItem = await Cart.create({ userId, groupedItemId, quantity });
//        res.status(201).json(cartItem);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

//// Get user's cart
//router.get('/:userId', async (req: Request, res: Response) => {
//    const { userId } = req.params;
//    try {
//        const cartItems = await Cart.findAll({
//            where: { userId },
//            include: [GroupedItem],
//        });
//        res.status(200).json(cartItems);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

//// Update cart item
//router.put('/:id', async (req: Request, res: Response) => {
//    const { quantity } = req.body;
//    try {
//        const cartItem = await Cart.findByPk(req.params.id);
//        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
//        await cartItem.update({ quantity });
//        res.status(200).json(cartItem);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

//// Remove cart item
//router.delete('/:id', async (req: Request, res: Response) => {
//    try {
//        const cartItem = await Cart.findByPk(req.params.id);
//        if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });
//        await cartItem.destroy();
//        res.status(200).json({ message: 'Cart item removed' });
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

export default router;

