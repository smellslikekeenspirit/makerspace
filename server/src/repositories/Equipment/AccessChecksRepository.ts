/** AccessChecksRepository.ts
 * DB operations endpoint for AccessChecks table
 */

import { knex } from "../../db";
import { AccessCheckRow } from "../../db/tables";



export async function getAccessChecks(): Promise<AccessCheckRow[]> {
    return await knex("AccessChecks").select("*");
}

export async function getAccessCheckByID(id: number): Promise<AccessCheckRow | undefined> {
    return await knex("AccessChecks").select("*").first().where({id: id});
}

export async function getAccessChecksByApproved(approved: boolean): Promise<AccessCheckRow[]> {
    return await knex("AccessChecks").select("*").where({approved: approved});
}

export async function createAccessCheck(userID: number, machineID: number): Promise<AccessCheckRow | undefined> {
    return await knex("AccessChecks").insert({
        userID: userID,
        machineID: machineID
    }).returning("*").first();
}

export async function setAccessCheckApproval(id: number, approved: boolean): Promise<AccessCheckRow | undefined> {
    return await knex("AccessChecks").update({
        approved: approved
    }).where({id: id}).returning("*").first();
}

export async function isApproved(userID: number, machineID: number): Promise<boolean> {
    const check = await knex("AccessChecks").select("*").where({userID: userID, machineID: machineID }).first();
    if (check?.approved) return true;
    return false;
}