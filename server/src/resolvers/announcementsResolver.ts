import * as AnnouncementsRepo from "../repositories/Announcements/AnnouncementsRepository";
import * as ModuleRepo from "../repositories/Training/ModuleRepository";
import * as HoldsRepo from "../repositories/Holds/HoldsRepository";
import { Privilege } from "../schemas/usersSchema";
import { createLog } from "../repositories/AuditLogs/AuditLogRepository";
import { ApolloContext } from "../context";
import { getUsersFullName } from "../repositories/Users/UserRepository";
import { getAnnouncements } from "../repositories/Announcements/AnnouncementsRepository";

const AnnouncementsResolver = {
    
    Query: {
      announcements: async (
        _parent: any,
        _args: any,
        {ifAllowed}: ApolloContext) =>
          ifAllowed([Privilege.MAKER, Privilege.MENTOR, Privilege.STAFF], async () => {
            return await getAnnouncements();
          }),
    },
  
    Mutation: {
      createAnnouncement: async (
        _parent: any,
        args: any,
        { ifAllowed }: ApolloContext) =>
          ifAllowed([Privilege.MENTOR, Privilege.STAFF], async () => {
            return await AnnouncementsRepo.createAnnouncement(args);
        })
      }
  };
  
  export default AnnouncementsResolver;