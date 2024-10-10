/** AuditLogRepository.ts
 * DB operations endpoint for AuditLog table
 */

import { knex } from "../../db/index.js";
import { logsToDomain } from "../../mappers/auditLogs/auditLogMapper.js";
import { AuditLog } from "../../schemas/auditLogsSchema.js";

export interface Filters {
  errors: string
  welcome: boolean
  auth: boolean
  status: boolean
  state: boolean
  help: boolean
  message: boolean
  server: boolean
  training: boolean
  admin: boolean
  uncategorized: boolean
}

/**
 * Create an AuditLog and append it to the table
 * @param message String verb description of the Log entry (i.e. reserved, deleted)
 * @param entities items involved in log {id, label}
 */
export async function createLog(
  message: string,
  category: string | undefined,
  ...entities: { id: any; label: string }[]
) {
  let formattedMessage = message;

  // "{user} reserved {equipment}" -> "<user:3:Matt> reserved <equipment:12:Table Saw>"
  entities.forEach(({ id, label }) => {
    const entityType = formattedMessage.match(/{(\w+)}/)?.[1];
    formattedMessage = formattedMessage.replace(
      /{\w+}/,
      `<${entityType}:${id}:${label}>`
    );
  });

  await knex("AuditLogs").insert({ message: formattedMessage, category });
}

/**
 * Create an AuditLog and append it to the table
 * @param message String verb description of the Log entry (i.e. reserved, deleted)
 * @param array of entities items involved in log {id, label}
 */
export async function createLogWithArray(
  message: string,
  category: string | undefined,
  entities: { id: any; label: string }[]
) {
  let formattedMessage = message;

  // "{user} reserved {equipment}" -> "<user:3:Matt> reserved <equipment:12:Table Saw>"
  entities.forEach(({ id, label }) => {
    const entityType = formattedMessage.match(/{(\w+)}/)?.[1];
    formattedMessage = formattedMessage.replace(
      /{\w+}/,
      `<${entityType}:${id}:${label}>`
    );
  });

  await knex("AuditLogs").insert({ message: formattedMessage, category });
}

/**
 * Fetch logs by filtered criteria
 * @param startDate earliest date to filter by
 * @param stopDate latest date to filter by
 * @param searchText text to filter by
 * @returns 
 */
export async function getLogs(
  startDate: string,
  stopDate: string,
  searchText: string,
  filters?: Filters
): Promise<AuditLog[]> {
  const filterString = ((filters?.welcome ? "'welcome', " : "")
    + (filters?.auth ? "'auth', " : "")
    + (filters?.help ? "'help', " : "")
    + (filters?.state ? "'state', " : "")
    + (filters?.status ? "'status', " : "")
    + (filters?.help ? "'help', " : "")
    + (filters?.message ? "'message', " : "")
    + (filters?.training ? "'training', " : "")
    + (filters?.admin ? "'admin', " : "")
    + (filters?.server ? "'server', " : "")
  );
  const filterSQL = `"category" = ALL (ARRAY[${filterString.substring(0, filterString.length-2)}])` + (filters?.uncategorized ? ` OR "category" IS NULL` : "");
  console.log(filterSQL)

  const knexResult = (filterString && filterString != "")
  ? await knex("AuditLogs")
  .select()
  .whereRaw(`("dateTime" at time zone 'UTC') BETWEEN TIMESTAMP '${new Date(startDate).toISOString().replace("T", " ").replace("Z", "")}' AND TIMESTAMP '${new Date(stopDate).toISOString().replace("T", " ").replace("Z", "")}'`)
  .whereRaw(filterSQL)
  .where("message", "ilike", `%${searchText}%`)
  .whereRaw((filters?.errors != "both" ? `message ${filters?.errors == "no-errors" ? "NOT " : ""} ilike '%<error:%'` : "TRUE"))
  .orderBy("dateTime", "DESC")
  .limit(100)
  : await knex("AuditLogs")
  .select()
  .whereRaw(`("dateTime" at time zone 'UTC') BETWEEN TIMESTAMP '${new Date(startDate).toISOString().replace("T", " ").replace("Z", "")}' AND TIMESTAMP '${new Date(stopDate).toISOString().replace("T", " ").replace("Z", "")}'`)
  .where("message", "ilike", `%${searchText}%`)
  .whereRaw((filters?.errors != "both" ? `message ${filters?.errors == "no-errors" ? "NOT " : ""} ilike '%<error:%'` : "TRUE"))
  .orderBy("dateTime", "DESC")
  .limit(100)

  return logsToDomain(knexResult);
}
