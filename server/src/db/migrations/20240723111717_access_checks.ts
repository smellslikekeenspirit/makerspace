import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  knex.schema.hasTable("AccessChecks").then(function (exists) {
    if (!exists) {
      return knex.schema.createTable("AccessChecks", function (t) {
        t.increments("id").primary();
        t.integer("userID").references("id").inTable("Users").notNullable();
        t.integer("machineID").references("id").inTable("Equipment").notNullable();
        t.date('readyDate').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        t.boolean("approved").defaultTo(false);
      });
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.hasTable("AccessChecks").then(function (exists) {
    if (exists) {
      return knex.schema.dropTable("AccessChecks");
    }
  });
}
