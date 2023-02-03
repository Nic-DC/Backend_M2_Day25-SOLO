import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import UsersModel from "./model.js";

const { NotFound } = createHttpError;

export const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
  try {
    const user = await UsersModel.create(req.body);
    res.status(201).send(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const query = {};
    if (req.query.name || req.query.category) {
      query.name = { [Op.iLike]: `%${req.query.name}%` };
      query.category = { [Op.startsWith]: `${req.query.category}` };
      const filteredUsers = await UsersModel.findAll({
        where: { ...query },
        attributes: ["name", "category", "price"],
      });
      res.send(filteredUsers);
    } else {
      const users = await UsersModel.findAll();
      res.send(users);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const searchedUser = await UsersModel.findByPk(req.params.userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (searchedUser) {
      res.send(searchedUser);
    } else {
      next(NotFound(`The user with id: ${req.params.userId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const [numerOfUpdatedRows, updatedRecords] = await UsersModel.update(req.body, {
      where: { id: req.params.userId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      returning: true,
    });
    console.log(`We're UPDATING - numerOfUpdatedRows: ${numerOfUpdatedRows}, updatedRecords: ${updatedRecords}`);
    if (numerOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(NotFound(`The user with id: ${req.params.userId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await UsersModel.destroy({
      where: { id: req.params.userId },
    });
    console.log("numberOfDeletedRows", numberOfDeletedRows);
    if (numberOfDeletedRows === 1) {
      res.send(`The user with id: ${req.params.userId} successfully deleted`);
    } else {
      next(NotFound(`The user with id: ${req.params.userId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
