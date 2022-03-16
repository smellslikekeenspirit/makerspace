import { gql } from "apollo-server-express";
import { TrainingModule } from "../models/training/trainingModule";
import { Hold } from "./holdsSchema";

export enum Privilege {
  MAKER,
  LABBIE,
  ADMIN,
}

export interface User {
  id: number;
  universityID: string;
  ritUsername: string;
  firstName: string;
  lastName: string;
  email: string;
  isStudent: boolean;
  privilege: Privilege;
  registrationDate: Date;
  holds: [Hold];
  completedModules: [TrainingModule];
  expectedGraduation: string;
  college: string;
  major: string;
  roomID: number;
}

export interface StudentUserInput {
  universityID: string;
  firstName: string;
  lastName: string;
  email: string;
  expectedGraduation: string;
  college: string;
  major: string;
}

export const UsersTypeDefs = gql`
  enum Privilege {
    MAKER
    LABBIE
    ADMIN
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    isStudent: Boolean!
    privilege: Privilege!
    registrationDate: DateTime!
    holds: [Hold]
    trainingModules: [TrainingModule]
    expectedGraduation: String
    college: String
    major: String
    room: Room
    roomMonitoring: Room

    """
    The number-letter combination that is attached to your RIT email
    (ie. abc1234). Not sensitive info. Stored plainly.
    Not to be confused with the universityID.
    """
    ritUsername: String!

    """
    The nine digit number encoded in the mag strip of RIT ID cards.
    Can also be found on the eServices and/or myRIT portals.
    Sensitive information. Stored as a SHA256 hash in the database.
    Not to be confused with RIT usernames (ie. abc1234)
    """
    universityID: String!
  }

  input StudentUserInput {
    universityID: String!
    ritUsername: String!
    firstName: String!
    lastName: String!
    email: String!
    expectedGraduation: String!
    college: String!
    major: String!
  }

  input FacultyUserInput {
    firstName: String!
    lastName: String!
    email: String!
  }

  extend type Query {
    users: [User]
    user(id: ID!): User
    currentUser: User
  }

  extend type Mutation {
    updateStudentUser(user: StudentUserInput): User
    updateFacultyUser(user: FacultyUserInput): User

    setPrivilege(userID: ID!, privilege: Privilege): User

    addTraining(userID: ID!, moduleID: ID!): User
    removeTraining(userID: ID!, moduleID: ID!): User

    addHold(userID: ID!, hold: HoldInput): User
    removeHold(userID: ID!, hold: HoldInput): User
  }
`;
