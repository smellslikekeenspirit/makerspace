import * as EquipmentRepo from "../repositories/Equipment/EquipmentRepository";
import * as RoomRepo from "../repositories/Rooms/RoomRepository";
import { ReservationRepository } from "../repositories/Equipment/ReservationRepository";
import { ApolloContext } from "../context";
import { Privilege } from "../schemas/usersSchema";
import { createLog } from "../repositories/AuditLogs/AuditLogRepository";
import { getUsersFullName } from "../repositories/Users/UserRepository";
import { EquipmentRow } from "../db/tables";
import { EquipmentInput } from "../schemas/equipmentSchema";

const reservationRepo = new ReservationRepository();

const EquipmentResolvers = {
  Query: {
    equipments: async (_parent: any, _args: any, _context: any) => {
      return await EquipmentRepo.getEquipment();
    },

    equipment: async (_parent: any, args: { id: string }, _context: any) => {
      return await EquipmentRepo.getEquipmentByID(Number(args.id));
    },

    archivedEquipments: async (_parent: any, _args: any, { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
        return await EquipmentRepo.getArchivedEquipment();
      }),

    archivedEquipment: async (_parent: any, args: { id: string }, { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
        return await EquipmentRepo.getArchivedEquipmentByID(Number(args.id));
      }),

    reservations: async (_parent: any, _args: any, _context: any) => {
      return await reservationRepo.getReservations();
    },

    reservation: async (_parent: any, args: { id: string }, _context: any) => {
      return await reservationRepo.getReservationById(Number(args.id));
    },
  },

  Equipment: {
    room: async (parent: EquipmentRow) => {
      return await RoomRepo.getRoomByID(parent.roomID);
    },

    hasAccess: async (parent: EquipmentRow, args: { uid: string }) => {
      return await EquipmentRepo.hasAccess(args.uid, parent.id);
    },

    trainingModules: async (parent: EquipmentRow) => {
      return await EquipmentRepo.getModulesByEquipment(parent.id);
    },
  },

  Mutation: {
    addEquipment: async (
      _parent: any,
      args: { equipment: EquipmentInput },
      { ifAllowed }: ApolloContext
    ) =>
      ifAllowed([Privilege.STAFF], async (user) => {
        const equipment = await EquipmentRepo.addEquipment(args.equipment);

        await createLog(
          "{user} created the {equipment} equipment.",
          { id: user.id, label: getUsersFullName(user) },
          { id: equipment.id, label: equipment.name }
        );

        return equipment;
      }),

    updateEquipment: async (
      _: any,
      args: { id: string; equipment: EquipmentInput },
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
        return await EquipmentRepo.updateEquipment(Number(args.id), args.equipment);
    }),

    archiveEquipment: async (_: any, args: { id: number },
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
        return await EquipmentRepo.setEquipmentArchived(args.id, true);
    }),

    publishEquipment: async (_: any, args: { id: number },
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
        return await EquipmentRepo.setEquipmentArchived(args.id, false);
    }),
  },
};

export default EquipmentResolvers;
