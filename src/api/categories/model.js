import { DataTypes } from "sequelize";
import sequelize from "../../db.js";

const CategoriesModel = sequelize.define("category", {
  categoryId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /* {timestamps: true} TIMESTAMPS HERE ARE TRUE BY DEFAULT */
});

export default CategoriesModel;
