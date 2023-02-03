import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import CategoriesModel from "./model.js";

const { NotFound } = createHttpError;

export const categoriesRouter = express.Router();

// POST
categoriesRouter.post("/", async (req, res, next) => {
  try {
    const category = await CategoriesModel.create(req.body);
    res.status(201).send(category);
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

categoriesRouter.delete("/:categoryId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await CategoriesModel.destroy({
      where: { id: req.params.categoryId },
    });
    console.log("numberOfDeletedRows", numberOfDeletedRows);
    if (numberOfDeletedRows === 1) {
      res.send(`The category with id: ${req.params.categoryId} successfully deleted`);
    } else {
      next(NotFound(`The category with id: ${req.params.categoryId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
