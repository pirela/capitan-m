import express from "express";

const publicRoutes = express.Router();

import productRoutes from "./routes/product";

publicRoutes.use("/product", productRoutes);

export default publicRoutes;
