import express from "express";

import {
  getProductById,
  postSearchLike,
  postSearchPrice
} from "./product/index";

const productRoutes = express.Router();

productRoutes.post("/search/text", postSearchLike());
productRoutes.post("/search/price", postSearchPrice());
productRoutes.get("/create/:id", getProductById());

export default productRoutes;
