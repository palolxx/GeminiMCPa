// Game Item Types and Models

/**
 * Error types for type safety
 */
export type DatabaseError = {
  code: string;
  message: string;
  details?: string;
};

export type ItemOperationResult<T> = {
  data: T | null;
  error: DatabaseError | null;
};

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * The core model for a game item.
 */
export interface GameItem {
  id: string;
  name: string;
  quantity: number;
  created_at: string;
  rarity?: ItemRarity;
}
