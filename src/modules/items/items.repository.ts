import { randomUUID } from 'node:crypto';
import type { CreateItemInput } from './items.schemas.js';

export interface Item {
  id: string;
  name: string;
  description?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export class ItemsRepository {
  private readonly items = new Map<string, Item>();

  findAll(): Item[] {
    return [...this.items.values()];
  }

  findById(id: string): Item | undefined {
    return this.items.get(id);
  }

  create(input: CreateItemInput): Item {
    const now = new Date().toISOString();
    const item: Item = {
      id: randomUUID(),
      name: input.name,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.price === undefined ? {} : { price: input.price }),
      createdAt: now,
      updatedAt: now
    };

    this.items.set(item.id, item);
    return item;
  }
}
