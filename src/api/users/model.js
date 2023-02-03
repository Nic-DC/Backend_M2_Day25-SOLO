import { DataTypes } from "sequelize";
import sequelize from "../../db.js";
import ReviewsModel from "../reviews/model.js";

const UsersModel = sequelize.define("user", {
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  /* {timestamps: true} TIMESTAMPS HERE ARE TRUE BY DEFAULT */
});

// 1-to-many
UsersModel.hasMany(ReviewsModel, { foreignKey: { allowNull: false } });
ReviewsModel.belongsTo(UsersModel);
export default UsersModel;
