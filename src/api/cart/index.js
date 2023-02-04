import express from "express";
import createHttpError from "http-errors";
import { Op } from "sequelize";
import Cart from "./model.js";
import UsersModel from "../users/model.js";
import ProductsModel from "../products/model.js";
import sequelize from "../../db.js";
const { NotFound } = createHttpError;

export const cartRouter = express.Router();
cartRouter.route("/:userId").get(async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await UsersModel.findByPk(userId);

    if (user) {
      const cartWithUserId = await Cart.findAll({
        /* before getting the user with the specified userId
         we want to see all the prodcuts that are associated
         with this user so we INCLUDE the products in the response */
        include: ProductsModel,

        /* we want to find how many units of the same product we
         have in the cart so we want to group them by productId
         - so we'll do this by grouping the cart by productId AND
         count the number of the same product within the cart 
         - the way we do it is that we'll pass another option, 
         ATTRIBUTES ---> in here: 
          1. we select the column by which we want to count by [productId] 
          2. the function that we ll use to count the number of products that
             are of the same type [for that, we'll need 
             to import sequelize from the library in order to be able to use
             the sequelize functions] & also we'll use the alias "product-quantity" 
          3. the function we ll use to sum the prices of each product that are of the same type   
          */
        attributes: [
          "productId",
          /* in the sequelize function we have the method - "count", AND the column
           that we want to count - "cart.id" [we also specify the table of the id]; AND we use the 
           the "product-quantity"  alias */
          [sequelize.fn("count", sequelize.col("cart.id")), "productQuantity"],

          /* we sum the column inside the product which is "price" - so it's going to be product.price */
          [sequelize.fn("sum", sequelize.col("product.price")), "totalPriceProduct"],
        ],

        /* we group by productId, product.id */
        group: ["productId", "product.id"],

        /* we get the user with the specified userId */
        where: { userId: userId },
      });

      /* count the total number of products that are in the cart where the userId === userId from the req.params */
      const totalNrOfProducts = await Cart.count({
        where: { userId: userId },
      });

      /* count the total number of products that are in the cart where the userId === userId from the req.params */
      const sumOfAllProducts = await Cart.sum("product.price", {
        include: { model: ProductsModel, attributes: [] },
      });
      res.send({ cartWithUserId, totalNrOfProducts, sumOfAllProducts });
    } else {
      next(NotFound(`User with id: ${userId} not in the db`));
    }
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
      const { userId, productId } = req.params;

      const user = await UsersModel.findByPk(userId);
      const product = await ProductsModel.findByPk(productId);

      if (user && product) {
        const cart = await Cart.destroy({
          where: { userId: userId, productId: productId },
        });
        res.send({ message: `The product with id: ${productId} from your cart has been successfully removed` });
      } else {
        next(NotFound(`Either user with id: ${userId} or product with id: ${productId} not in the db`));
      }
    } catch (error) {
      console.log("CART - DELETE endpoint ERROR: ", error);
      next(error);
    }
  });
