import axios from "axios";
import https from "https";
import uuid from "uuid/v4";
import Sequelize, { Op } from "sequelize";

import { logger, defValues } from "../../../utils";

import db from "../../../models";

const Model = db.products;

const getUrl = (productId) => {
  return `${process.env.URL_WOOCOMMERCE}${productId}?consumer_key=${process.env.WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${process.env.WOOCOMMERCE_CONSUMER_SECRET}`;
};

const transformProduct = ({
  product,
  parentId,
  create = true,
  woocommerce = true,
}) => {
  let newProduct = {};
  const productId = create ? uuid() : product.productId;
  const externalId = create ? product.id : product.externalId;
  if (create) {
    newProduct = {
      external_id: externalId,
      externalId,
      product_id: productId,
      productId,
      parent_id: parentId,
      parentId,
      sku: product.sku,
      image: create
        ? product.images[0]
          ? product.images[0].src
          : ""
        : product.image,
      name: product.name,
      searchText: product.name,
      shortDescription: product.short_description,
      longDescription: product.description,
      price: Number(product.price),
      jsonProduct: product,
      ...defValues(),
      storeProductId: woocommerce ? "Woocommerce" : "Shopify",
    };
  } else {
    newProduct = { ...product.dataValues };
  }

  if (parentId) {
    if (create) {
      newProduct.variants = [
        {
          legacyResourceId: parentId,
          inventoryQuantity: product.stock_quantity,
          selectedOptions: [
            ...product.jsonProduct.attributes.map((attribute) => {
              return {
                name: attribute.name,
                value: attribute.option,
              };
            }),
          ],
          displayName: product.name,
          price: Number(product.price),
        },
      ];
    } else {
      newProduct.variants = [
        {
          legacyResourceId: parentId,
          inventoryQuantity: product.stock_quantity,
          selectedOptions: [
            ...newProduct.jsonProduct.attributes.map((attribute) => {
              return {
                name: attribute.name,
                value: attribute.option,
              };
            }),
          ],
          displayName: product.name,
          price: Number(product.price),
        },
      ];
    }
  }
  return newProduct;
};

export const getProductById = () => async (req, res) => {
  try {

    const searchId = req.params.id;

    const existProduct = await Model.findOne({
      attributes: ["productId"],
      where: {
        externalId: searchId,
      },
    });

    if (existProduct) {
      res.status(201).json({
        message:
          "El producto ya se encuentra registrado en nuestra base de datos",
      });
      return;
    }

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    let dataWoocommerce = [];
    let newProduct = {};
    let dataResponsesVariants = [];

    const responseWoocommerce = await axios.get(getUrl(searchId), {
      httpsAgent: agent,
    });

    if (responseWoocommerce) {
      dataWoocommerce = responseWoocommerce.data;

      const variantsRequests = dataWoocommerce.variations.map((variant) => {
        return axios.get(getUrl(variant), {
          httpsAgent: agent,
        });
      });

      newProduct = transformProduct({
        product: dataWoocommerce,
      });

      const dataCreate = await Model.create(newProduct);

      const responsesVariants = await Promise.all(variantsRequests);

      dataResponsesVariants = responsesVariants.map((response) => {
        if (response) {
          return transformProduct({
            product: response.data,
            parentId: dataCreate.productId,
          });
        }
      });

      const dataBulkCreate = await Model.bulkCreate(dataResponsesVariants);

      newProduct.variants = [];

      dataResponsesVariants.forEach((dataVariant) => {
        dataVariant.variants.forEach((variant) => {
          newProduct.variants.push({ ...variant });
        });
      });
    } else {
      //TODO search on shopify
      console.info("buscar en shopify...");
    }

    delete newProduct.jsonProduct;

    if (dataWoocommerce) {
      res.status(200).json({
        succes: "true",
        message: "OK",
        result: { count: newProduct.length, items: newProduct },
      });
    } else {
      res.status(200).json({
        succes: "false",
        message: "Ha ocurrido un error",
        result: { count: newProduct.length, items: newProduct },
      });
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const postSearchLike = () => async (req, res) => {
  const { searchTxt } = await req.body;

  try {
    const products = await Model.findAll({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("search_text")),
        { [Op.like]: `%${searchTxt}%` }
      ),
    });

    const categories = products.map(({ productId }) => {
      return Model.findAll({
        where: {
          parentId: productId,
        },
      });
    });

    const responsesCategories = await Promise.all(categories);

    const newProducts = products.map((product) =>
      transformProduct({ product, create: false })
    );

    const newCatories = [];
    responsesCategories.forEach((productCategories, index) => {
      newCatories.push([]);
      return productCategories.forEach((productCategory) => {
        newCatories[index].push(
          transformProduct({
            product: productCategory,
            parentId: productCategory.parentId,
            create: false,
          })
        );
      });
    });

    const finalData = [];
    newProducts.forEach((product, index) => {
      finalData.push({
        ...product,
        shortDescription: product.jsonProduct.short_description,
        longDescription: product.jsonProduct.description,
        variants: newCatories[index],
      });
      delete finalData[index].jsonProduct;
    });

    if (finalData) {
      res.status(200).json({
        succes: "true",
        message: "OK",
        result: { count: finalData.length, items: finalData },
      });
    } else {
      throw new Error("No se encontro la data");
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const postSearchPrice = () => async (req, res) => {
  try {
    const { price, type } = await req.body;
    let operator;
    switch (type) {
      case "-1":
        operator = "lt";
        break;
      case "0":
        operator = "eq";
        break;
      case "1":
        operator = "gt";
        break;

      default:
        break;
    }

    const products = await Model.findAll({
      where: {
        price: {
          [Op[operator]]: price,
        },
      },
    });

    const categories = products.map(({ productId }) => {
      return Model.findAll({
        where: {
          parentId: productId,
        },
      });
    });

    const responsesCategories = await Promise.all(categories);

    const newProducts = products.map((product) =>
      transformProduct({ product, create: false })
    );

    const newCatories = [];
    responsesCategories.forEach((productCategories, index) => {
      newCatories.push([]);
      return productCategories.forEach((productCategory) => {
        newCatories[index].push(
          transformProduct({
            product: productCategory,
            parentId: productCategory.parentId,
            create: false,
          })
        );
      });
    });

    const finalData = [];
    newProducts.forEach((product, index) => {
      finalData.push({
        ...product,
        variants: newCatories[index],
      });
      delete finalData[index].jsonProduct;
    });

    if (finalData) {
      res.status(200).json({
        succes: "true",
        message: "OK",
        result: { count: finalData.length, items: finalData },
      });
    } else {
      throw new Error("No se encontro la data");
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
