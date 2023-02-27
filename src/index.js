import express from "express";
import cors from "cors";

import "@shopify/shopify-api/adapters/node";
import { shopifyApi } from "@shopify/shopify-api";

import config from "./config";
import { logger } from "./utils";

import publicRoutes from "./api/public";

import bodyParser from "body-parser";

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: ["read_products"],
  hostName: process.env.SHOPIFY_HOSTNAME,
});

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.get('/auth', async (req, res) => {
  const x = await shopify.auth.begin({
    shop: shopify.utils.sanitizeShop(process.env.SHOPIFY_URL_SANITIZE, true),
    callbackPath: '/auth/callback',
    isOnline: true,
    rawRequest: req,
    rawResponse: res,
  });
  console.info("x", x)
});

app.get('/auth/callback', async (req, res) => {
  console.info("x", req, res)
});

app.use("/public", publicRoutes);

app.get("/", (req, res) => {
  res.send("Capitan M.");
});

app.listen({ port: config.port }, () => {
  logger.info(`\n\n🚀 Server ready at http://localhost:${config.port}\n\n`);
});

process.on("uncaughtException", (e) => {
  console.log(
    "An error has occured. error is: %s and stack trace is: %s",
    e,
    e.stack
  );
  console.log("Process will restart now.");
  process.exit(1);
});
