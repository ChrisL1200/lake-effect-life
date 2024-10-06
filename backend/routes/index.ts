import { Express } from 'express';
import authRoutes from './authRoutes';
import groupedItemRoutes from './groupedItemRoutes';
import cartRoutes from './cartRoutes';

export const registerRoutes = (app: Express) => {
    app.use('/auth', authRoutes);
    app.use('/grouped-items', groupedItemRoutes);
    app.use('/cart', cartRoutes);
};

