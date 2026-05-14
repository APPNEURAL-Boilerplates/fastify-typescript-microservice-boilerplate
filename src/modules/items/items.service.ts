import { NotFoundError } from '../../common/errors.js';
import type { CreateItemInput } from './items.schemas.js';
import type { Item, ItemsRepository } from './items.repository.js';

export class ItemsService {
  constructor(private readonly repository: ItemsRepository) {}

  listItems(): Item[] {
    return this.repository.findAll();
  }

  getItem(id: string): Item {
    const item = this.repository.findById(id);

    if (!item) {
      throw new NotFoundError('Item not found', { id });
    }

    return item;
  }

  createItem(input: CreateItemInput): Item {
    return this.repository.create(input);
  }
}
