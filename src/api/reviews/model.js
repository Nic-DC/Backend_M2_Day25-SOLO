import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const ReviewsModel = sequelize.define("review", {
  reviewId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  /* {timestamps: true} TIMESTAMPS HERE ARE TRUE BY DEFAULT */
});

export default ReviewsModel;
