import { Sequelize } from "sequelize";

const { PG_DB, PG_USER, PG_PASSWORD, PG_HOST, PG_PORT } = process.env;

const sequelize = new Sequelize(PG_DB, PG_USER, PG_PASSWORD, {
  host: PG_HOST,
  port: PG_PORT,
  dialect: "postgres",
});

export const pgConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Successfully connected to Postgres`);
  } catch (error) {
    console.log(`Error when trying to connect to Postgres`, error);
    process.exit(1); // kills node.js process when error
  }
};

export const syncModels = async () => {
  await sequelize.sync({ alter: true });
  console.log(`All tables successfully synchronized`);
};
export default sequelize;
