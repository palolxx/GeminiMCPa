-- Create the rarity enum type
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- Add rarity column with a default value of 'common'
ALTER TABLE items 
ADD COLUMN rarity item_rarity NOT NULL DEFAULT 'common';

-- Update existing items with random rarity values based on weights
UPDATE items SET rarity = 
  CASE 
    WHEN random() < 0.03 THEN 'legendary'::item_rarity
    WHEN random() < 0.10 THEN 'epic'::item_rarity
    WHEN random() < 0.25 THEN 'rare'::item_rarity
    WHEN random() < 0.50 THEN 'uncommon'::item_rarity
    ELSE 'common'::item_rarity
  END;

-- Create an index on rarity for faster filtering
CREATE INDEX idx_items_rarity ON items(rarity);

-- Add a comment explaining the rarity distribution
COMMENT ON COLUMN items.rarity IS 'Item rarity level with approximate distribution: common (50%), uncommon (25%), rare (15%), epic (7%), legendary (3%)';
