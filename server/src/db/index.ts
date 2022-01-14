const connection =
  require("../db/knexFile")[process.env.NODE_ENV || "development"];
const knex = require("knex")(connection);

export { knex }