import express from "express";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

registerRoutes(app);

export default app;
