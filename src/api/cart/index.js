import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import Cart from "./model.js";
import UsersModel from "../users/model.js";
import ProductsModel from "../products/model.js";
const { NotFound } = createHttpError;

export const cartRouter = express.Router();
cartRouter.route("/:userId").get(async (req, res, next) => {
  try {
  } catch (error) {
    console.log("CART - GET endpoint ERROR: ", error);
    next(error);
  }
});

cartRouter
  .route("/:userId/:productId")
  .post(async (req, res, next) => {
    try {
      const { userId, productId } = req.params;

      const user = await UsersModel.findByPk(userId);
      const product = await ProductsModel.findByPk(productId);

      if (user && product) {
        const cart = await Cart.create({ userId, productId });
        res.send(cart);
      } else {
        next(NotFound(`Either user with id: ${userId} or product with id: ${productId} not in the db`));
      }
    } catch (error) {
      console.log("CART - POST endpoint ERROR: ", error);
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
    } catch (error) {
      console.log("CART - DELETE endpoint ERROR: ", error);
      next(error);
    }
  });
