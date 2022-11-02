import * as UserRepo from "../repositories/Users/UserRepository";
import * as ModuleRepo from "../repositories/Training/ModuleRepository";
import { Privilege } from "../schemas/usersSchema";
import { createLog } from "../repositories/AuditLogs/AuditLogRepository";
import assert from "assert";
import { ApolloContext } from "../context";
import { UserRow } from "../db/tables";

export function getUsersFullName(user: UserRow) {
  return `${user.firstName} ${user.lastName}`;
}

const UsersResolvers = {
  User: {
    passedModules: (parent: { id: number }) => {
      return ModuleRepo.getPassedModulesByUser(parent.id);
    },
  },

  Query: {
    users: async (_: any,
      args: {null: any},
      {ifAllowed}: ApolloContext) =>
        ifAllowed([Privilege.ADMIN], async (user) => {
          return await UserRepo.getUsers();
    }),

    user: async (_: any, args: { id: number }) => {
      return await UserRepo.getUserByID(args.id);
    },

    currentUser: async (parent: any, args: any, context: ApolloContext) => {
      return context.user;
    },
  },

  Mutation: {
    createUser: async (_: any, args: any, context: any,
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.LABBIE, Privilege.ADMIN], async () => {
        return await UserRepo.createUser(args);
    }),

    updateStudentProfile: async (
      parent: any,
      args: {
        userID: number;
        pronouns: string;
        college: string;
        expectedGraduation: string;
        universityID: string;
      },
      context: any,
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.LABBIE, Privilege.ADMIN], async () => {
        const hashedUniversityID = hashUniversityID(args.universityID);

        return await UserRepo.updateStudentProfile({
          ...args,
          universityID: hashedUniversityID,
        });
    }),

    setPrivilege: async (
      _: any,
      { userID, privilege }: { userID: number; privilege: Privilege },
      context: ApolloContext,
      { ifAllowed }: ApolloContext) =>
      ifAllowed([Privilege.LABBIE, Privilege.ADMIN], async () => {
        assert(context.user);

        const userSubject = await UserRepo.setPrivilege(userID, privilege);
        assert(userSubject);

        await createLog(
          `{user} set {user}'s access level to ${privilege}.`,
          { id: context.user.id, label: getUsersFullName(context.user) },
          { id: userSubject.id, label: getUsersFullName(userSubject) }
        );
    }),

    deleteUser: async (
      parents: any,
      args: { userID: number },
      {ifAllowed}: ApolloContext) => {

      return ifAllowed(
        [Privilege.ADMIN],
        async (user) => {

          const userSubject = await UserRepo.getUserByID(args.userID);

          await createLog(
            `{user} deleted {user}'s profile.`,
            { id: user.id, label: getUsersFullName(user) },
            { id: args.userID, label: getUsersFullName(userSubject) }
          );

          return await UserRepo.archiveUser(args.userID);
        }
      );
    },
  },
};

export default UsersResolvers;
