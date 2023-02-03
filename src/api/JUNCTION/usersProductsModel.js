import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import UsersModel from "../users/model.js";
import ProductsModel from "../products/model.js";

const usersProductsModel = sequelize.define("userProduct", {
  userProductID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

// many-to-many
UsersModel.belongsToMany(ProductsModel, {
  through: usersProductsModel,
  foreignKey: { name: "userId", allowNull: false },
});
ProductsModel.belongsToMany(UsersModel, {
  through: usersProductsModel,
  foreignKey: { name: "reviewId", allowNull: false },
});

export default usersProductsModel;
