import {Room} from "../../models/rooms/room";
import { knex } from "../../db";
import {singleRoomToDomain, roomsToDomain} from "../../mappers/rooms/roomMapper";

export interface IRoomRepo {
    getRoomByID(logID: number): Promise<Room | null>;
    getRooms(): Promise<Room[]>;

    addRoom(room: Room): Promise<Room | null>;
    removeRoom(roomID: number): Promise<void>;

    updateRoomName(roomID: number, name: string): Promise<Room | null>;

    addEquipmentToRoom(roomID: number, equipmentID: number): Promise<Room | null>;
    removeEquipmentFromRoom(roomID: number, equipmentID: number): Promise<Room | null>;

    addUserToRoom(roomID: number, userID: number): Promise<Room | null>;
    removeUserFromRoom(roomID: number, userID: number): Promise<Room | null>;

    addLabbieToRoom(roomID: number, labbieID: number): Promise<Room | null>;
    removeLabbieFromRoom(roomID: number, labbieID: number): Promise<Room | null>;
}

export class RoomRepo implements IRoomRepo {

    private queryBuilder;

    constructor(queryBuilder?: any) {
        this.queryBuilder = queryBuilder || knex;
    }

    async getRoomByID(roomID: number): Promise<Room | null> {
        const knexResult = await this.queryBuilder
            .first(
                "id",
                "name"
            )
            .from("Rooms")
            .where("id", roomID);

        return singleRoomToDomain(knexResult);
    }

    async getRooms(): Promise<Room[]> {
        const knexResult = await this.queryBuilder("Rooms").select(
            "Rooms.id",
            "Rooms.name"
        );
        return roomsToDomain(knexResult)
    }

    async addRoom(room: Room): Promise<Room | null> {
        const newID = (
            await this.queryBuilder("Rooms").insert(
                {
                    name: room.name
                },
                "id"
            )
        )[0];
        return await this.getRoomByID(newID);
    }

    async removeRoom(roomID: number): Promise<void> {
        await this.queryBuilder("Rooms").where({id: roomID}).del();
    }

    async updateRoomName(roomID: number, name: string): Promise<Room | null> {
        const updateName = await this.queryBuilder("Rooms")
            .where({id: roomID})
            .update({
                name: name
            });

        return await this.getRoomByID(roomID);
    }

    async addEquipmentToRoom(roomID: number, equipmentID: number): Promise<Room | null> {
        await this.queryBuilder("EquipmentForRooms").insert(
            {
                roomID: roomID,
                equipmentID: equipmentID
            },
            "id"
        );

        const updateEquipRoom = await this.queryBuilder("Equipment")
            .where({id: equipmentID})
            .update({
                roomID: roomID
            });
        return await this.getRoomByID(roomID);
    }

    async removeEquipmentFromRoom(roomID: number, equipmentID: number): Promise<Room | null> {
        await this.queryBuilder("EquipmentForRooms")
            .where("roomID", "=", roomID)
            .where("equipmentID", "=", equipmentID).del();

        const updateEquipRoom = await this.queryBuilder("Equipment")
            .where({id: equipmentID})
            .update({
                roomID: null
            });
        return await this.getRoomByID(roomID);

        return await this.getRoomByID(roomID);
    }

    async addLabbieToRoom(roomID: number, labbieID: number): Promise<Room | null> {
        await this.queryBuilder("LabbiesForRooms").insert(
            {
                roomID: roomID,
                labbieID: labbieID
            },
            "id"
        );

        const updateLabbieRoom = await this.queryBuilder("User")
            .where({id: labbieID})
            .update({
                roomID: roomID,
                monitoringRoomID: roomID
            });
        return await this.getRoomByID(roomID);
    }

    async removeLabbieFromRoom(roomID: number, labbieID: number): Promise<Room | null> {
        await this.queryBuilder("LabbiesForRooms")
            .where("roomID", "=", roomID)
            .where("labbieID", "=", labbieID).del();

        const updateLabbieRoom = await this.queryBuilder("User")
            .where({id: labbieID})
            .update({
                roomID: null,
                monitoringRoomID: null
            });

        return await this.getRoomByID(roomID);
    }

    async addUserToRoom(roomID: number, userID: number): Promise<Room | null> {
        await this.queryBuilder("UsersForRooms").insert(
            {
                roomID: roomID,
                userID: userID
            },
            "id"
        );

        const updateLabbieRoom = await this.queryBuilder("User")
            .where({id: userID})
            .update({
                roomID: roomID
            });
        return await this.getRoomByID(roomID);
    }

    async removeUserFromRoom(roomID: number, userID: number): Promise<Room | null> {
        await this.queryBuilder("UsersForRooms")
            .where("roomID", "=", roomID)
            .where("userID", "=", userID).del();

        const updateLabbieRoom = await this.queryBuilder("User")
            .where({id: userID})
            .update({
                roomID: null
            });

        return await this.getRoomByID(roomID);
    }


}