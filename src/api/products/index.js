import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ProductsModel from "./model.js";
import ProductsCategoriesModel from "../JUNCTION/productsCategoriesModel.js";

const { NotFound } = createHttpError;

export const productsRouter = express.Router();

// POST - without the ProductsCategoriesModel
// productsRouter.post("/", async (req, res, next) => {
//   try {
//     const product = await ProductsModel.create(req.body);
//     res.status(201).send(product);
//   } catch (error) {
//     next(error);
//   }
// });

// POST - with the ProductsCategoriesModel
productsRouter.post("/", async (req, res, next) => {
  try {
    // const product = await ProductsModel.create(req.body);
    // console.log("product", product);
    // console.log("req.body", req.body);
    // const id = product.id;
    // console.log("product id:", id);

    const { productId } = await ProductsModel.create(req.body);
    console.log("productId", productId);
    if (req.body.categories) {
      await ProductsCategoriesModel.bulkCreate(
        req.body.categories.map((category) => {
          return { categoryId: category, productId: productId };
        })
      );
    }
    console.log("req.categories", req.body.categories);
    res.status(201).send({ productId: productId });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name) {
      query.name = { [Op.iLike]: `%${req.query.name}%` };
      const filteredProducts = await ProductsModel.findAll({
        where: { ...query },
        attributes: ["name", "category", "price"],
      });
      res.send(filteredProducts);
    } else if (req.query.category) {
      query.category = { [Op.startsWith]: `${req.query.category}` };
      const filteredProducts = await ProductsModel.findAll({
        where: { ...query },
        attributes: ["name", "category", "price"],
      });
      res.send(filteredProducts);
    } else {
      const products = await ProductsModel.findAll();
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const searchedProduct = await ProductsModel.findByPk(req.params.productId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (searchedProduct) {
      res.send(searchedProduct);
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numerOfUpdatedRows, updatedRecords] = await ProductsModel.update(req.body, {
      where: { id: req.params.productId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      returning: true,
    });
    console.log(`We're UPDATING - numerOfUpdatedRows: ${numerOfUpdatedRows}, updatedRecords: ${updatedRecords}`);
    if (numerOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({
      where: { id: req.params.productId },
    });
    console.log("numberOfDeletedRows", numberOfDeletedRows);
    if (numberOfDeletedRows === 1) {
      res.send(`The product with id: ${req.params.productId} successfully deleted`);
    } else {
      next(NotFound(`The product with id: ${req.params.productId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
