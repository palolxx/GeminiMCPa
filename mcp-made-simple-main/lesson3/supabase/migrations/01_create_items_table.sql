-- Create the items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all users to read items
CREATE POLICY "Allow public read access"
  ON items
  FOR SELECT
  TO public
  USING (true);

-- Create a policy that allows public to insert items
CREATE POLICY "Allow public insert access"
  ON items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy that allows public to update items
CREATE POLICY "Allow public update access"
  ON items
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert some initial items
INSERT INTO items (name, quantity) VALUES
  ('Wooden Sword', 1),
  ('Health Potion', 5),
  ('Iron Shield', 2),
  ('Magic Staff', 1),
  ('Leather Armor', 3);

-- Create an index on name for faster searches
CREATE INDEX items_name_idx ON items (name);

-- Create an index on created_at for chronological queries
CREATE INDEX items_created_at_idx ON items (created_at);

-- Add helpful comments
COMMENT ON TABLE items IS 'Game inventory items';
COMMENT ON COLUMN items.id IS 'Unique identifier for each item';
COMMENT ON COLUMN items.name IS 'Name of the item';
COMMENT ON COLUMN items.quantity IS 'Number of this item in inventory';
COMMENT ON COLUMN items.created_at IS 'When this item was added to inventory';
