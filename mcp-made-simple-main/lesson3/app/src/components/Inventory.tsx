import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GameItem, ItemOperationResult } from '../api/model';
import { ItemCard } from './ItemCard';
import { DEMO_ITEMS } from '../api/dummy';
import styles from './Inventory.module.css';

export function Inventory() {
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems(): Promise<void> {
    try {
      setLoading(true);
      setError(null);
      setIsDemo(false);

      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || !supabase) {
        setItems(DEMO_ITEMS);
        setError('⚠️ Using demo data - Supabase not configured');
        setIsDemo(true);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('items')
        .select('*')
        .order('created_at');

      if (dbError) {
        setItems(DEMO_ITEMS);
        setError('⚠️ Database error - Using demo data');
        setIsDemo(true);
        console.error('Database error:', dbError);
        return;
      }

      if (!data) {
        setItems(DEMO_ITEMS);
        setError('⚠️ No data received - Using demo data');
        setIsDemo(true);
        return;
      }

      setItems(data);
    } catch (err) {
      setItems(DEMO_ITEMS);
      setError('⚠️ Unexpected error - Using demo data');
      setIsDemo(true);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBuy = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item || item.quantity <= 0) return;

      if (isDemo || !supabase) {
        // Handle demo data locally
        setItems(items.map(i => 
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        ));
        return;
      }

      const { error: updateError } = await supabase
        .from('items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', itemId);

      if (updateError) {
        console.error('Error updating item:', updateError);
        return;
      }

      // Update local state
      setItems(items.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } catch (err) {
      console.error('Error buying item:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.error}>
            <span>{error}</span>
            <button
              className={styles.infoButton}
              onClick={() => setShowInstructions(!showInstructions)}
              title="Setup Instructions"
            >
              ℹ️
            </button>
          </div>
          {showInstructions && (
            <div className={styles.instructions}>
              <h3>Setup Instructions:</h3>
              <ol>
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                <li>Copy your project URL and anon key from the project settings</li>
                <li>Create a <code>.env</code> file in the app directory with:
                  <pre>
                    VITE_SUPABASE_URL=your-project-url
                    VITE_SUPABASE_ANON_KEY=your-anon-key
                  </pre>
                </li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
        </div>
      )}
      <div className={styles.grid}>
        {items.map(item => (
          <ItemCard 
            key={item.id} 
            item={item}
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
}
