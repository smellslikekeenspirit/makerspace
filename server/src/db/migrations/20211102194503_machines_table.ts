import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    
    return knex.schema.hasTable('EquipmentLabels').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('EquipmentLabels', function(t) {
                t.increments('id');
                t.string('name', 50);
              });
        }
    }).then(async () => {
      // table that stores training modules attached to equipment labels
      const exists = await knex.schema.hasTable('ModulesForLabels');
      if (!exists) {
        return knex.schema.createTable('ModulesForLabels', function (t) {
          t.increments('id');
          t.integer('equipmentLabelId').references('id').inTable('EquipmentLabels');
          t.integer('trainingModuleId').references('id').inTable('TrainingModule');
        });
      }
    }).then(async () => {
      const exists = await knex.schema.hasTable('Equipment');
      if (!exists) {
        return knex.schema.createTable('Equipment', function (t) {
          t.increments('id');
          t.string('name', 50);
          t.string('room', 5);
          t.timestamp('addedAt').defaultTo(knex.fn.now());
          t.boolean('inUse').defaultTo(false);
          t.integer('room_id').references("id").inTable("Rooms");
        });
      }
    }).then(async () => {
      const exists = await knex.schema.hasTable('LabelsForEquipment');
      if (!exists) {
        return knex.schema.createTable('LabelsForEquipment', function (t) {
          t.increments('id');
          t.integer('equipmentId').references('id').inTable('Equipment');
          t.integer('equipmentLabelId').references('id').inTable('EquipmentLabels');
        });
      }
    }).then(async () => {
      const exists = await knex.schema.hasTable('Reservations');
      if (!exists) {
        return knex.schema.createTable('Reservations', function (t) {
          t.increments('id');
          t.integer('userId').references('id').inTable('Users');
          t.integer('equipmentId').references('id').inTable('Equipment');
          t.timestamp('createdAt').defaultTo(knex.fn.now());
          t.time('startTime');
          t.time('endTime');
        });
      }
    });

}

export async function down(knex: Knex): Promise<void> {

  return knex.schema.hasTable('EquipmentLabels').then(function(exists) {
    if (exists) {
      return knex.schema.dropTable('EquipmentLabels');
    }
  }).then(async () => {
    const exists = await knex.schema.hasTable('ModulesForLabels');
    if (exists) {
      return knex.schema.dropTable('ModulesForLabels');
    }
  }).then(async () => {
    const exists = await knex.schema.hasTable('Equipment');
    if (exists) {
      return knex.schema.dropTable('Equipment');
    }
  }).then(async () => {
    const exists = await knex.schema.hasTable('LabelsForEquipment');
    if (exists) {
      return knex.schema.dropTable('LabelsForEquipment');
    }
  }).then(async () => {
    knex.schema.hasTable('Reservations').then(function(exists) {
    if (exists) {
      return knex.schema.dropTable('Reservations');
    }
  });
});

}