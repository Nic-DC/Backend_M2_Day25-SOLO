import sequelize from "../../db.js";
import { DataTypes } from "sequelize";
import ProductsModel from "../products/model.js";
import UsersModel from "../users/model.js";

const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

/* ------------------ 1-to-many: USER & PRODUCTS -------------------- */
UsersModel.hasMany(Cart, { foreignKey: { allowNull: false } });
Cart.belongsTo(UsersModel, { foreignKey: { allowNull: false } });

/* ------------------ 1-to-many: CART & PRODUCTS -------------------- */
ProductsModel.hasMany(Cart, { foreignKey: { allowNull: false } });
Cart.belongsTo(ProductsModel, { foreignKey: { allowNull: false } });

export default Cart;
