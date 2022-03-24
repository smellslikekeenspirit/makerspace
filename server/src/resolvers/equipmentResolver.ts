import { EquipmentInput } from "../models/equipment/equipmentInput";
import * as EquipmentRepo from "../repositories/Equipment/EquipmentRepository";
import * as RoomRepo from "../repositories/Rooms/RoomRepository";
import { ReservationRepository } from "../repositories/Equipment/ReservationRepository";
import { Equipment } from "../models/equipment/equipment";


const reservationRepo = new ReservationRepository();

const EquipmentResolvers = {
  Query: {
    equipments: async (_: any, args: any, context: any) => {
      return await EquipmentRepo.getEquipments();
    },

    equipment: async (_: any, args: { id: number }, context: any) => {
      return await EquipmentRepo.getEquipmentById(args.id);
    },

    reservations: async (_: any, args: { Id: number }, context: any) => {
      return await reservationRepo.getReservations();
    },

    reservation: async (_: any, args: { Id: number }, context: any) => {
      return await reservationRepo.getReservationById(args.Id);
    },

    trainingModulesByEquipment: async (
        _: any,
        args: { Id: number },
        context: any
    ) => {
      return await EquipmentRepo.getTrainingModules(args.Id);
    },
  },

  Equipment: {
    room: (parent: Equipment) => {
      return RoomRepo.getRoomByID(parent.roomID);
    },

    trainingModules: (parent: Equipment) => {
      return EquipmentRepo.getTrainingModules(parent.id);
    },
  },

  Mutation: {
    addEquipment: async (
        _: any,
        args: { equipment: EquipmentInput },
        context: any
    ) => {
      return await EquipmentRepo.addEquipment(args.equipment);
    },

    updateEquipment: async (
        _: any,
        args: { id: number; equipment: EquipmentInput },
        context: any
    ) => {
      return await EquipmentRepo.updateEquipment(args.id, args.equipment);
    },

    deleteEquipment: async (_: any, args: { id: number }, context: any) => {
      return await EquipmentRepo.archiveEquipment(args.id);
    },
  },
};

export default EquipmentResolvers;