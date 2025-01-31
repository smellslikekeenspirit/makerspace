import { gql } from "@apollo/client";
import Equipment from "../types/Equipment";

export interface Reader {
  helpRequested: boolean;
  id: number,
  machineID: string,
  machineType: string,
  name: string,
  zone: string
  temp: number,
  state: string,
  user: {id: number, firstName: string, lastName: string}
  recentSessionLength: number,
  lastStatusReason: string,
  scheduledStatusFreq: number,
  lastStatusTime: string,
  BEVer: string,
  FEVer: string,
  HWVer: string
}

export const GET_READERS = gql`
  query GetReaders {
    readers {
      id
      machineID
      machineType
      name
      zone
      temp
      state
      user {
        id
        firstName
        lastName
      }
      recentSessionLength
      lastStatusReason
      scheduledStatusFreq
      lastStatusTime
      helpRequested
      BEVer
      FEVer
      HWVer
    }
  }
`

export const GET_READER = gql`
  query GetReader($id: ID!) {
    reader(id: $id) {
      id
      machineID
      machineType
      name
      zone
      temp
      state
      currentUID
      recentSessionLength
      lastStatusReason
      scheduledStatusFreq
      lastStatusTime
    }
  }
`;

export const CREATE_READER = gql`
  mutation CreateReader(
    $id: ID!,
    $machineID: string,
    $machineType: string,
    $name: string,
    $zone: string,
  ) {
    createReader(
      id: $id,
      machineID: $machineID,
      machineType: $machineType,
      name: $name,
      zone: $zone,
    ) {
      id
      machineID
      machineType
      name
      zone
    }
  }
`;

export const SET_READER_NAME = gql`
  mutation SetReaderName($id: ID!, $name: string) {
    setName(id: $id, name: $name) {
      id
      machineID
      machineType
      name
      zone
      temp
      state
      currentUID
      recentSessionLength
      lastStatusReason
      scheduledStatusFreq
      lastStatusTime
    }
  }
`;