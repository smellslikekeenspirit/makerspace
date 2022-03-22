import { knex } from "../../db";
import { Reservation } from "../../models/equipment/reservation";
import { ReservationInput } from "../../models/equipment/reservationInput";
import { reservationsToDomain, singleReservationToDomain } from "../../mappers/equipment/Reservation";

export interface IReservationRepository {
  createReservation(reservation: ReservationInput): Promise<Reservation | null>;
  assignLabbieToReservation(resId: number, labbieId: number): Promise<Reservation | null>;
  addComment(resId: number, authorId: number, commentText: string): Promise<string | null>;
  cancelReservation(resId: number): Promise<Reservation | null>;
  confirmReservation(resId: number): Promise<Reservation | null>;
  getReservationById(id: number | string): Promise<Reservation | null>;
  getReservations(): Promise<Reservation[]>;
}

export class ReservationRepository implements IReservationRepository {

    private queryBuilder

    constructor(queryBuilder?: any) {
        this.queryBuilder = queryBuilder || knex
    }

    public async getReservationById(id: string | number): Promise<Reservation | null> {
      const knexResult = await this.queryBuilder
      .first(
        "id",
        "creator",
        "labbie",
        "maker",
        "createDate",
        "startTime",
        "endTime",
        "equipment",
        "status",
        "lastUpdated"
        )
      .from("Reservations")
      .where("id", id);

      return singleReservationToDomain(knexResult);
    }

    public async getReservations(): Promise<Reservation[]> {
      const knexResult = await this.queryBuilder("Reservations").select(
        "id",
        "creator",
        "labbie",
        "maker",
        "createDate",
        "startTime",
        "endTime",
        "equipment",
        "status",
        "lastUpdated"
      );
      return reservationsToDomain(knexResult);
    }

    public async updateReservation(id: number, reservation: ReservationInput): Promise<Reservation | null> {
        await this.queryBuilder("Reservations")
        .where("id", id)
        .update({
          creator: reservation.creator,
          labbie: reservation.labbie,
          maker: reservation.maker,
          equipment: reservation.equipment,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          startingMakerComment: reservation.startingMakerComment
        });
        return this.getReservationById(id);
    }

    public async createReservation(reservation: ReservationInput): Promise<Reservation | null> {
      
      const newId = (
        await this.queryBuilder("Reservations").insert(
          {
            creator: reservation.creator,
            labbie: reservation.labbie,
            maker: reservation.maker,
            equipment: reservation.equipment,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            startingMakerComment: reservation.startingMakerComment
          },
          "id"
        )
      )[0];
      return await this.getReservationById(newId);
    }

  public async assignLabbieToReservation(resId: number, labbieId: number): Promise<Reservation | null> {
    await this.queryBuilder("Reservations")
      .where("id", resId)
      .update({labbie: labbieId});
    return await this.getReservationById(resId);
  }

  public async addComment(resId: number, authorId: number, commentText: string): 
  Promise<string | null> {
    const newId = (
      await this.queryBuilder("ReservationEvents").insert(
        {
          eventType: "COMMENT",
          reservationId: resId,
          user: authorId,
          payload: commentText
        },
        "id"
      )
    )[0];

    return knex("Reservations")
    .join(
      "ReservationEvents",
      "Reservations.id",
      "=",
      "ReservationEvents.reservationId"
    )
    .select("ReservationEvents.payload")
    .where("Reservations.id", resId)
    .orderBy("ReservationEvents.dateTime", "desc")
    .limit(1);
  }

    public async confirmReservation(resId: number): Promise<Reservation | null> {
      await this.queryBuilder("Reservations")
      .where("id", resId)
      .update({status: "CONFIRMED"});
      return await this.getReservationById(resId);
    }

    public async cancelReservation(resId: number): Promise<Reservation | null> {
      await this.queryBuilder("Reservations")
      .where("id", resId)
      .update({status: "CANCELLED"});
      return await this.getReservationById(resId);
    }
}
