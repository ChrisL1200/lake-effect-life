import { Router, Request, Response } from 'express';
import GroupedItem from '../models/GroupedItem';
import ItemColor from '../models/ItemColor';
import Item from '../models/Item';
import multer from 'multer';
import { uploadImage } from '../service/s3Service';
import { Op } from 'sequelize';
// import { authenticate } from '../middleware/auth';
const router = Router();
const storage = multer.memoryStorage();
// const upload = multer({ storage });

// Update Create GroupedItem to handle images
//router.post('/', upload.array('images', 5), async (req: Request, res: Response) => {
//    try {
//        const { type, gender } = req.body;
//        const groupedItem = await GroupedItem.create({ type, gender });

//        if (req.files) {
//            const imgUrls = await Promise.all(
//                req.files?.map(async (file: Express.Multer.File) => await uploadImage(file)) || []
//            );
//        }

//        await ItemColor.create({
//            color: req.body.color, // Ensure 'color' is provided in the request
//            groupedItemId: groupedItem.id,
//            imgUrls,
//        });

//        res.status(201).json(groupedItem);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

// Read All GroupedItems with Search, Filter, Pagination
router.get('/', async (req: Request, res: Response) => {
    const { search, type, gender, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (gender) where.gender = gender;
    if (search) where.type = { [Op.iLike]: `%${search}%` }; // Example search on type

    try {
        const groupedItems = await GroupedItem.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(limit),
            limit: Number(limit),
            include: [{
                model: ItemColor,
                include: [{
                    model: Item,
                }]
            }],
        });
        res.status(200).json({
            data: groupedItems.rows,
            total: groupedItems.count,
            page: Number(page),
            pageSize: limit,
            totalPages: Math.ceil(groupedItems.count / Number(limit)),
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Read Single GroupedItem
//router.get('/:id', async (req: Request, res: Response) => {
//    try {
//        const groupedItem = await GroupedItem.findByPk(req.params.id, {
//            include: [ItemColor],
//        });
//        if (!groupedItem) return res.status(404).json({ message: 'GroupedItem not found' });
//        res.status(200).json(groupedItem);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

// Update GroupedItem
//router.put('/:id', async (req: Request, res: Response) => {
//    try {
//        const groupedItem = await GroupedItem.findByPk(req.params.id);
//        if (!groupedItem) return res.status(404).json({ message: 'GroupedItem not found' });
//        const { type, gender } = req.body;
//        await groupedItem.update({ type, gender });
//        res.status(200).json(groupedItem);
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

// Delete GroupedItem
//router.delete('/:id', async (req: Request, res: Response) => {
//    try {
//        const groupedItem = await GroupedItem.findByPk(req.params.id);
//        if (!groupedItem) return res.status(404).json({ message: 'GroupedItem not found' });
//        await groupedItem.destroy();
//        res.status(200).json({ message: 'GroupedItem deleted' });
//    } catch (error: any) {
//        res.status(400).json({ error: error.message });
//    }
//});

export default router;

