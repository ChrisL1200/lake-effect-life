import { Express } from "express";
import authRoutes from "./authRoutes";
import groupedItemRoutes from "./groupedItemRoutes";
import cartRoutes from "./cartRoutes";
import adminAuthRoutes from "./adminAuthRoutes";
import adminInventoryRoutes from "./adminInventoryRoutes";
import adminLookupRoutes from "./adminLookupRoutes";
import inventoryRoutes from "./inventoryRoutes";

export const registerRoutes = (app: Express) => {
  app.use("/auth", authRoutes);
  app.use("/grouped-items", groupedItemRoutes);
  app.use("/cart", cartRoutes);
  app.use("/admin/auth", adminAuthRoutes);
  app.use("/admin/inventory", adminInventoryRoutes);
  app.use("/admin/lookups", adminLookupRoutes);
  app.use("/inventory", inventoryRoutes);
};
