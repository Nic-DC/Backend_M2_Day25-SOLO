import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ReviewsModel from "../reviews/model.js";

const ProductsModel = sequelize.define("product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  /* {timestamps: true} TIMESTAMPS HERE ARE TRUE BY DEFAULT */
});

/* ------------------ 1-to-many: PRODUCT & REVIEWS -------------------- */
ProductsModel.hasMany(ReviewsModel, { foreignKey: { allowNull: false } });
ReviewsModel.belongsTo(ProductsModel, { foreignKey: { allowNull: false } });

export default ProductsModel;
