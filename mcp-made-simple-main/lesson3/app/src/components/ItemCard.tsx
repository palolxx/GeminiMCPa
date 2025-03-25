import { useState } from 'react';
import { GameItem } from '../api/model';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: GameItem;
  onBuy: (itemId: string) => Promise<void>;
}

export function ItemCard({ item, onBuy }: ItemCardProps) {
  const [isBuying, setIsBuying] = useState(false);
  const cardClassName = `${styles.card} ${item.rarity ? styles[item.rarity] : styles.common} ${isBuying ? styles.buying : ''}`;

  const handleBuy = async () => {
    if (item.quantity > 0 && !isBuying) {
      setIsBuying(true);
      await onBuy(item.id);
      // Reset animation after a short delay
      setTimeout(() => setIsBuying(false), 300);
    }
  };

  return (
    <div className={cardClassName}>
      <h3 className={styles.name}>{item.name}</h3>
      <div className={styles.quantity}>{item.quantity}</div>
      <button 
        onClick={handleBuy}
        disabled={item.quantity === 0 || isBuying}
        className={styles.buyButton}
      >
        {isBuying ? 'Buying...' : 'Buy'}
      </button>
    </div>
  );
}
