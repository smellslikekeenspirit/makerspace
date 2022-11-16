import { knex } from "../db";
import * as EquipmentRepo from "../repositories/Equipment/EquipmentRepository";
import * as RoomRepo from "../repositories/Rooms/RoomRepository";
import * as ModuleRepo from "../repositories/Training/ModuleRepository";
import * as UserRepo from "../repositories/Users/UserRepository";
import * as Holdsrepo from "../repositories/Holds/HoldsRepository";
import { hashUniversityID } from "../repositories/Users/UserRepository";

const tables = ["ModuleSubmissions", "ModulesForEquipment", "Equipment", "TrainingModule", "Holds", "Rooms", "Users"];

const testRoom = {
  id: "0",
  name: "Test Room"
};

describe("EquipmentRepository tests", () => {
  beforeAll(() => {
    return knex.migrate.latest();
    // we can here also seed our tables, if we have any seeding files
  });

  beforeEach(async () => {
    try {
      // reset tables...
      for(const t of tables) {
        await knex(t).del();
      }
    } catch (error) {
      fail("Failed setup");
    }
  });

  afterAll(async () => {
    try {
      // reset tables...
      for(const t of tables) {
        await knex(t).del();
      }
      await knex.destroy();
    } catch (error) {
      fail("Failed teardown");
    }
  });

  test("getEquipments with no rows", async () => {
    let equipmentRows = await EquipmentRepo.getEquipments();
    expect(equipmentRows.length).toBe(0);
  });

  test("addEquipment and get", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment
    await EquipmentRepo.addEquipment({
      name: "Test Equipment",
      roomID: roomID,
      moduleIDs: <string[]>[]
    });

    let equipmentRows = await EquipmentRepo.getEquipments();
    expect(equipmentRows.length).toBe(1);
  });

  test("getEquipmentByID", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add and get ID
    const equipmentID = (await EquipmentRepo.addEquipment({
      name: "Test Equipment",
      roomID: roomID,
      moduleIDs: <string[]>[]
    })).id;

    // Get by ID
    let equipmentRow = await EquipmentRepo.getEquipmentByID(equipmentID);
    expect(equipmentRow).toBeDefined();
  });

  test("updateEquipment", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom({
        id: "0",
        name: "Test Room"
    })).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Update name
    await EquipmentRepo.updateEquipment(equipmentID, {
        name: "Test Equipment Updated",
        roomID: roomID,
        moduleIDs: <string[]>[]
    });

    // Check name updated
    expect((await EquipmentRepo.getEquipmentByID(equipmentID)).name).toBe("Test Equipment Updated");
  });

  test("archiveEquipment", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Update name
    await EquipmentRepo.archiveEquipment(equipmentID);

    // Check archived
    expect((await EquipmentRepo.getEquipmentByID(equipmentID)).archived).toBe(true);
  });

  test("addModulesToEquipment and get", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    const moduleID = (await ModuleRepo.addModule("Test Module")).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Add module to equipment
    await EquipmentRepo.addModulesToEquipment(equipmentID, [moduleID]);

    const modules = await EquipmentRepo.getModulesByEquipment(equipmentID);
    expect(modules.length).toBe(1);
    expect(modules[0].name).toBe("Test Module");
  });

  test("updateModules", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    const moduleOneID = (await ModuleRepo.addModule("Test Module I")).id;
    const moduleTwoID = (await ModuleRepo.addModule("Test Module II")).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Add module to equipment
    await EquipmentRepo.addModulesToEquipment(equipmentID, [moduleOneID]);

    const modulesPreUpdate = await EquipmentRepo.getModulesByEquipment(equipmentID);
    expect(modulesPreUpdate.length).toBe(1);
    expect(modulesPreUpdate[0].name).toBe("Test Module I");

    // Update to use module II
    await EquipmentRepo.updateModules(equipmentID, [moduleTwoID]);

    const modulesPostUpdate = await EquipmentRepo.getModulesByEquipment(equipmentID);
    expect(modulesPostUpdate.length).toBe(1);
    expect(modulesPostUpdate[0].name).toBe("Test Module II");
  });

  test("hasAcccess no modules", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Create user
    const userID = (await UserRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      ritUsername: "jd0000",
      email: "jd0000@example.com",
    })).id;

    const uid = "000000000";

    // Update with UID
    const user = await UserRepo.updateStudentProfile({
      userID: userID,
      pronouns: "he/him",
      college: "Test College",
      expectedGraduation: "2050",
      universityID: uid
    });

    expect(user.universityID).toBe(hashUniversityID(uid));

    expect(await EquipmentRepo.hasAccess(uid, equipmentID)).toBe(true);
  });

  test("hasAcccess bad swipe", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Create user
    const userID = (await UserRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      ritUsername: "jd0000",
      email: "jd0000@example.com",
    })).id

    const uid = "000000000";

    // Update with UID
    const user = await UserRepo.updateStudentProfile({
      userID: userID,
      pronouns: "he/him",
      college: "Test College",
      expectedGraduation: "2050",
      universityID: uid
    });

    expect(user.universityID).toBe(hashUniversityID(uid));

    // Place a hold on themselves
    await Holdsrepo.createHold(
      userID,
      userID,
      "Test Hold"
    );

    // Check access for non-existent user
    expect(await EquipmentRepo.hasAccess("111111111", equipmentID)).toBe(false);
  });

  test("hasAcccess with one module", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Create user
    const userID = (await UserRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      ritUsername: "jd0000",
      email: "jd0000@example.com",
    })).id;

    const uid = "000000000";

    // Update with UID
    const user = await UserRepo.updateStudentProfile({
      userID: userID,
      pronouns: "he/him",
      college: "Test College",
      expectedGraduation: "2050",
      universityID: uid
    });

    expect(user.universityID).toBe(hashUniversityID(uid));

    // Create module
    const moduleID = (await ModuleRepo.addModule("Test Module")).id;

    // Add module to equipment
    await EquipmentRepo.addModulesToEquipment(equipmentID, [moduleID]);

    // Add passed attempt to user
    await UserRepo.addTrainingModuleAttemptToUser(userID, moduleID, true);

    expect(await EquipmentRepo.hasAccess(uid, equipmentID)).toBe(true);
  });

  test("hasAcccess with hold", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Create user
    const userID = (await UserRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      ritUsername: "jd0000",
      email: "jd0000@example.com",
    })).id;

    const uid = "000000000";

    // Update with UID
    const user = await UserRepo.updateStudentProfile({
      userID: userID,
      pronouns: "he/him",
      college: "Test College",
      expectedGraduation: "2050",
      universityID: uid
    });

    expect(user.universityID).toBe(hashUniversityID(uid));

    // Place a hold on themselves
    await Holdsrepo.createHold(
      userID,
      userID,
      "Test Hold"
    );

    expect(await EquipmentRepo.hasAccess(uid, equipmentID)).toBe(false);
  });

  test("hasAcccess with insufficient training", async () => {
    // Add a room
    const roomID = (await RoomRepo.addRoom(testRoom)).id;

    // Add equipment to the room
    const equipmentID = (await EquipmentRepo.addEquipment({
        name: "Test Equipment",
        roomID: roomID,
        moduleIDs: <string[]>[]
    })).id;

    // Check added
    expect(await EquipmentRepo.getEquipmentByID(equipmentID)).toBeDefined();

    // Create user
    const userID = (await UserRepo.createUser({
      firstName: "John",
      lastName: "Doe",
      ritUsername: "jd0000",
      email: "jd0000@example.com",
    })).id;

    const uid = "000000000";

    // Update with UID
    const user = await UserRepo.updateStudentProfile({
      userID: userID,
      pronouns: "he/him",
      college: "Test College",
      expectedGraduation: "2050",
      universityID: uid
    });

    expect(user.universityID).toBe(hashUniversityID(uid));

    // Create module
    const moduleID = (await ModuleRepo.addModule("Test Module")).id;

    // Add module to equipment
    await EquipmentRepo.addModulesToEquipment(equipmentID, [moduleID]);

    expect(await EquipmentRepo.hasAccess(uid, equipmentID)).toBe(false);
  });

});
