import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import Cart from "./model.js";

const { NotFound } = createHttpError;

export const cartRouter = express.Router();
cartRouter.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    console.log("CART - GET endpoint ERROR: ", error);
    next(error);
  }
});
