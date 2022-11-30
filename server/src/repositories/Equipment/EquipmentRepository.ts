import { knex } from "../../db";
import { EntityNotFound } from "../../EntityNotFound";
import { EquipmentRow, TrainingModuleRow, UserRow } from "../../db/tables";
import { EquipmentInput } from "../../schemas/equipmentSchema";
import * as ModuleRepo from "../Training/ModuleRepository";
import * as HoldsRepo from "../Holds/HoldsRepository";
import * as UserRepo from "../Users/UserRepository";

export async function getEquipmentByID(id: string): Promise<EquipmentRow> {
  const equipment = await knex("Equipment").where({ id }).first();

  if (!equipment) throw new EntityNotFound("Could not find equipment #${id}");

  return equipment;
}

export async function archiveEquipment(id: string): Promise<EquipmentRow> {
  await knex("Equipment").where({ id: id }).update({ archived: true });
  return getEquipmentByID(id);
}

export async function getEquipments(): Promise<EquipmentRow[]> {
  return knex("Equipment").select();
}

export async function getEquipmentWithRoomID(
  roomID: string
): Promise<EquipmentRow[]> {
  return knex("Equipment").select().where({ roomID });
}

export async function getModulesByEquipment(
  equipmentID: string
): Promise<TrainingModuleRow[]> {
  return await knex("ModulesForEquipment")
  .join("TrainingModule", "TrainingModule.id", "ModulesForEquipment.moduleID")
  .select("TrainingModule.*")
  .where("ModulesForEquipment.equipmentID", equipmentID);
}

export async function hasTrainingModules(
  user: UserRow,
  equipmentID: string
): Promise<boolean> {
  let modules = await getModulesByEquipment(equipmentID);
  let hasTraining = true;
  // get last submission from maker for every module
  for(let i = 0; i < modules.length; i++) {
    if (await ModuleRepo.hasPassedModule(user.id, modules[i].id)) {
      continue;
    }
    else {
      hasTraining = false;
      break;
    }
  }
  return hasTraining;
}

export async function hasAccess(
  uid: string,
  equipmentID: string
): Promise<boolean> {
  const user = await UserRepo.getUserByUniversityID(uid);   // Get user for this university ID
  return user !== undefined &&                              // Ensure user exists
    !(await HoldsRepo.hasActiveHolds(user.id)) &&           // Ensure user has no holds
    await hasTrainingModules(user, equipmentID);            // Ensure user has completed necessary training
}

export async function addModulesToEquipment(
  id: string,
  moduleIDs: string[]
): Promise<void> {
  await knex("ModulesForEquipment").insert(
    moduleIDs.map((trainingModule) => ({
      equipmentID: id,
      moduleID: trainingModule,
    }))
  );
}

export async function updateModules(
  id: string,
  moduleIDs: string[]
): Promise<void> {
  await knex("ModulesForEquipment").del().where("equipmentID", id);
  if (moduleIDs && moduleIDs.length > 0) {
    await addModulesToEquipment(id, moduleIDs);
  }
}

export async function updateEquipment(
  id: string,
  equipment: EquipmentInput
): Promise<EquipmentRow> {
  await knex("Equipment").where("id", id).update({
    name: equipment.name,
    roomID: equipment.roomID,
  });

  await updateModules(id, equipment.moduleIDs);

  return getEquipmentByID(id);
}

export async function addEquipment(
  equipment: EquipmentInput
): Promise<EquipmentRow> {
  const [id] = await knex("Equipment").insert(
    {
      name: equipment.name,
      roomID: equipment.roomID,
    },
    "id"
  );

  if (equipment.moduleIDs?.length)
    await addModulesToEquipment(id, equipment.moduleIDs);

  return await getEquipmentByID(id);
}
