import { GameItem } from './model';

// Demo items with proper rarity distribution
export const DEMO_ITEMS: GameItem[] = [
  {
    id: '1',
    name: 'Wooden Sword',
    quantity: 3,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Health Potion',
    quantity: 5,
    created_at: new Date().toISOString()
  },
];
