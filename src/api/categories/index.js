import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import CategoriesModel from "./model.js";
import ProductsModel from "../products/model.js";
import ProductsCategoriesModel from "../JUNCTION/productsCategoriesModel.js";

const { NotFound } = createHttpError;

export const categoriesRouter = express.Router();

// POST
categoriesRouter.post("/:id/addCategory", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductsModel.findByPk(id);
    console.log("product with categories", product);
    if (product) {
      const category = await CategoriesModel.create(req.body);
      const categoryId = category.categoryId;
      const productCategory = await ProductsCategoriesModel.create({ categoryId: categoryId, productId: id });
      console.log("productCategory", productCategory);
      res.status(201).send(category);
    } else {
      next(NotFound(`The product with id: ${id} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

// POST - BULK
categoriesRouter.post("/bulk", async (req, res, next) => {
  try {
    const categories = await CategoriesModel.bulkCreate([
      { name: "Node.js" },
      { name: "Backend" },
      { name: "Databases" },
      { name: "React.js" },
    ]);
    res.send(categories.map((c) => c.categoryId));
  } catch (error) {
    next(error);
  }
});

// GET - all <FILTERED>
categoriesRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name) {
      query.name = { [Op.iLike]: `%${req.query.name}%` };
      const filteredCategorys = await CategoriesModel.findAll({
        where: { ...query },
        attributes: ["name"],
      });
      res.send(filteredCategorys);
    } else {
      const categorys = await CategoriesModel.findAll({ attributes: ["name", "categoryId"] });
      res.send(categorys);
    }
  } catch (error) {
    next(error);
  }
});

categoriesRouter.get("/:categoryId", async (req, res, next) => {
  try {
    const searchedCategory = await CategoriesModel.findByPk(req.params.categoryId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (searchedCategory) {
      res.send(searchedCategory);
    } else {
      next(NotFound(`The category with id: ${req.params.categoryId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

categoriesRouter.put("/:categoryId", async (req, res, next) => {
  try {
    const [numerOfUpdatedRows, updatedRecords] = await CategoriesModel.update(req.body, {
      where: { id: req.params.categoryId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      returning: true,
    });
    console.log(`We're UPDATING - numerOfUpdatedRows: ${numerOfUpdatedRows}, updatedRecords: ${updatedRecords}`);
    if (numerOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(NotFound(`The category with id: ${req.params.categoryId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

categoriesRouter.delete("/:id/removeCategory/:categoryId", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductsModel.findByPk(id);
    console.log("product with categories", product);
    if (product) {
      const numberOfDeletedRows = await CategoriesModel.destroy({
        where: { categoryId: req.params.categoryId },
      });

      // the below code is redundant - the destroy method above also deletes the corresponding row in the ProductsCategoriesModel table
      // console.log("numberOfDeletedRows: ", numberOfDeletedRows);
      // const numberOfDeletedRowsJunctionTable = await ProductsCategoriesModel.destroy({
      //   where: { categoryId: req.params.categoryId },
      // });
      // console.log("numberOfDeletedRowsJunctionTable: ", numberOfDeletedRowsJunctionTable);

      if (numberOfDeletedRows === 1) {
        res.send(`The category with id: ${req.params.categoryId} successfully deleted from the 2 tables`);
      } else {
        next(NotFound(`The category with id: ${req.params.categoryId} not in the dbs`));
      }
    } else {
      next(NotFound(`The product with id: ${id} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
