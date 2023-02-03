import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import ProductsModel from "./model.js";
import ProductsCategoriesModel from "../JUNCTION/productsCategoriesModel.js";
import CategoriesModel from "../categories/model.js";
import ReviewsModel from "../reviews/model.js";

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

// GET - with categories & reviews
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
      const products = await ProductsModel.findAll({
        include: [
          {
            model: CategoriesModel,
            attributes: ["categoryId", "name"],
            through: { attributes: ["productCategoryID"] },
          },
          {
            model: ReviewsModel,
            attributes: ["content", "rate"],
          },
        ],
      });
      res.send(products);
    }
  } catch (error) {
    next(error);
  }
});

// GET - with pagination
productsRouter.get("/pagination", async (req, res, next) => {
  try {
    // Get the page number and number of items per page from the query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    // Calculate the skip and offset values
    const skip = (page - 1) * limit;
    const offset = limit;

    // Use Sequelize to find the users and paginate the results
    const products = await ProductsModel.findAll({
      offset,
      limit,
      // order: [['createdAt', 'DESC']],
    });

    // Send the paginated results back to the client
    // res.send(products);

    // Get the total number of users
    const totalProducts = await ProductsModel.count();
    console.log("totalProducts", totalProducts);

    // Calculate the number of pages
    const pages = Math.ceil(totalProducts / limit);

    // Build the response object
    const response = {
      pagination: {
        currentPage: page,
        totalPages: pages,
        perPage: limit,
      },
      products,
    };

    // Add a link to the next page if it exists
    if (page < pages) {
      response.pagination.next = `/products/pagination?page=${page + 1}&limit=${limit}`;
    } else {
      response.pagination.previous = `/products/pagination?page=${page - 1}&limit=${limit}`;
    }

    // Send the response back to the client
    res.send(response);
  } catch (error) {
    console.log("GET - with pagination endpoint - ERROR: ", error);
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
      where: { productId: req.params.productId },
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
      where: { productId: req.params.productId },
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
