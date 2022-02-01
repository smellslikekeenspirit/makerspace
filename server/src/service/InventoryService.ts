import { InventoryItem } from "../models/store/inventoryItem";
import { IInventoryRepo } from "../repositories/Store/inventoryRepository";

export class InventoryService {
    inventoryRepo: IInventoryRepo;
   
    constructor(repo: IInventoryRepo) {
      this.inventoryRepo = repo;
    }
   
    public async getInventoryItemsById(id: number) : Promise<InventoryItem> {
      return await this.inventoryRepo.getItemById(id);
    }

    public async getAllInventoryItems() : Promise<InventoryItem[]> {
      return await this.inventoryRepo.getItems();
    }

    public async addItemToInventory(item: InventoryItem) : Promise<InventoryItem> {
        return await this.inventoryRepo.addItem(item);
    }

    public async addAmountToItem(itemId: number, amount: number) : Promise<InventoryItem> {
        return this.inventoryRepo.addItemAmount(itemId, amount);
    }

    public async removeAmountFromItem(itemId: number, amount: number) : Promise<InventoryItem> {
      return this.inventoryRepo.addItemAmount(itemId, -1 * amount);
    }

    public async deleteInventoryItem(itemId: number) : Promise<void> {
      return this.inventoryRepo.deleteItemById(itemId);
    }

  }