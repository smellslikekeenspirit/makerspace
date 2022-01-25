import { InventoryItem } from "../models/store/inventoryItem";
import { IInventoryRepo } from "../repositories/Store/inventoryRepository";

export class InventoryService {
    inventoryRepo: IInventoryRepo;
   
    constructor(repo: IInventoryRepo) {
      this.inventoryRepo = repo;
    }
   
    public async getAllInventoryItems() : Promise<InventoryItem[]> {
      return await this.inventoryRepo.getItems();
    }

    public async addItemToInventory(item: InventoryItem) : Promise<InventoryItem> {
        return this.inventoryRepo.addItem(item);
    }

    public async addAmountToItem(itemId: number, amount: number) : Promise<InventoryItem> {
        return this.inventoryRepo.addItemAmount(item);
    }

  }