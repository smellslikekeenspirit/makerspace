/** roomMapper.ts
 * Map room entries to attributes
 */

import { Room } from "../../models/rooms/room";

export function roomsToDomain(raw: any): Room[] {
  return raw.map((i: any) => {
    return singleRoomToDomain(i);
  });
}

export function singleRoomToDomain(raw: any): Room | null {
  if (!raw) return null;

  return {
    id: raw.id,
    name: raw.name,
    pictureURL: raw.pictureURL,
    archived: raw.archived
  };
}
