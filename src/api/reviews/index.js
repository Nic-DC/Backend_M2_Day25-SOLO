import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";

const { NotFound } = createHttpError;

export const reviewsRouter = express.Router();

reviewsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductsModel.findByPk(id);

    const body = { ...req.body, productId: id };
    console.log("product with reviews", product);
    if (product) {
      const review = await ReviewsModel.create(body);
      res.status(201).send(review);
    } else {
      next(NotFound(`The product with id: ${id} not in the db`));
    }
  } catch (error) {
    console.log("catch error: ", error);
    next(error);
  }
});

// GET - filtered reviews by rate
reviewsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ProductsModel.findByPk(id);
    console.log("product with reviews", product);
    if (product) {
      const query = {};
      if (req.query.rate) {
        query.rate = { [Op.eq]: `${req.query.rate}` };

        const filteredReviews = await ReviewsModel.findAll({
          where: { ...query },
          attributes: ["content"],
        });
        res.send(filteredReviews);
      } else {
        const reviews = await ReviewsModel.findAll();
        res.send(reviews);
      }
    } else {
      next(NotFound(`The product with id: ${id} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:reviewId", async (req, res, next) => {
  try {
    const searchedReview = await ReviewsModel.findByPk(req.params.reviewId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }, // (SELECT) pass an object with exclude property for the omit list
    });
    if (searchedReview) {
      res.send(searchedReview);
    } else {
      next(NotFound(`The review with id: ${req.params.reviewId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.put("/:reviewId", async (req, res, next) => {
  try {
    const [numerOfUpdatedRows, updatedRecords] = await ReviewsModel.update(req.body, {
      where: { id: req.params.reviewId },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      returning: true,
    });
    console.log(`We're UPDATING - numerOfUpdatedRows: ${numerOfUpdatedRows}, updatedRecords: ${updatedRecords}`);
    if (numerOfUpdatedRows === 1) {
      res.send(updatedRecords[0]);
    } else {
      next(NotFound(`The review with id: ${req.params.reviewId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete("/:reviewId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ReviewsModel.destroy({
      where: { id: req.params.reviewId },
    });
    console.log("numberOfDeletedRows", numberOfDeletedRows);
    if (numberOfDeletedRows === 1) {
      res.send(`The review with id: ${req.params.reviewId} successfully deleted`);
    } else {
      next(NotFound(`The review with id: ${req.params.reviewId} not in the db`));
    }
  } catch (error) {
    next(error);
  }
});
