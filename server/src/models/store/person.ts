import { InventoryItem } from "./inventoryItem";

// this class might/should be replaced with an actual user class
export interface Person {
    id: number;
    item: InventoryItem;
    count: number;
}