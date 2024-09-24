import { gql } from "graphql-tag";

export interface EquipmentInput {
  name: string;
  roomID: number;
  moduleIDs: number[];
  imageUrl: string | null;
  sopUrl: string | null
}

export const EquipmentTypeDefs = gql`
  type Equipment {
    id: ID!
    name: String!
    archived: Boolean!
    room: Room!
    trainingModules: [TrainingModule]
    addedAt: DateTime!
    inUse: Boolean!
    hasAccess(uid: String): Boolean!
    imageUrl: String
    sopUrl: String
  }

  input EquipmentInput {
    name: String!
    roomID: ID!
    moduleIDs: [ID]
    imageUrl: String!
    sopUrl: String!
  }

  extend type Query {
    equipments: [Equipment]
    equipment(id: ID!): Equipment
    archivedEquipments: [Equipment]
    archivedEquipment(id: ID!): Equipment
    anyEquipment(id: ID!): Equipment
  }

  extend type Mutation {
    addEquipment(equipment: EquipmentInput): Equipment
    updateEquipment(id: ID!, equipment: EquipmentInput): Equipment
    archiveEquipment(id: ID!): Equipment
    publishEquipment(id: ID!): Equipment
  }
`;
