# Lesson 3: Game Inventory with MCP and Supabase

This lesson demonstrates how to build a game inventory system that evolves from a simple in-memory database to a full Supabase implementation with MCP tools.

## Prerequisites

- Node.js and npm
- Supabase account
- IDE with MCP support (Windsurf or Cursor)
- [Python 3.12](https://www.python.org/downloads/release/python-3120/) or newer (required for Supabase MCP server)
- pipx

## MCP Server Setup

1. Verify Python version (required by [Supabase MCP server](https://github.com/alexander-zuev/supabase-mcp-server)):

   ```bash
   # Try both commands - one of them should work
   python --version   # Should be 3.12 or newer
   python3 --version # If 'python' doesn't work
   ```

   If Python 3.12+ is not installed, download it from [python.org](https://www.python.org/downloads/release/python-3120/) and ensure it's added to PATH during installation.

2. Install pipx and supabase-mcp-server

   ```bash
   # Install and configure pipx
   python -m pip install --user pipx
   python -m pipx ensurepath

   # Install Supabase MCP
   pipx install supabase-mcp-server
   ```

3. Configure MCP servers in Windsurf or Cusor using the `mcp.json` file

## Stage 1: In-Memory Database

We start with a simple React app using an in-memory database for rapid prototyping:

### Data Model

```typescript
interface GameItem {
  id: string;
  name: string;
  quantity: number;
  created_at: string;
}
```

### Demo Data Structure

Located in `src/api/dummy.tsx`:

```typescript
export const DEMO_ITEMS: GameItem[] = [
  {
    id: "1",
    name: "Wooden Sword",
    quantity: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Health Potion",
    quantity: 5,
    created_at: new Date().toISOString(),
  },
];
```

### Project Structure

```
app/
├── src/
│   ├── api/
│   │   ├── model.tsx   # Core types
│   │   └── dummy.tsx   # In-memory database
│   └── components/     # React components
        ├── Inventory.tsx
        └── ItemCard.tsx
```

### Running the App

```bash
cd app
npm install
npm run dev
```

## Stage 2: Manual Supabase Integration

### Database Setup

1. Create Tables and Policies

   ```sql
   -- Create items table with proper constraints
   CREATE TABLE items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     quantity INTEGER NOT NULL CHECK (quantity >= 0),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
   );

   -- Enable Row Level Security
   ALTER TABLE items ENABLE ROW LEVEL SECURITY;

   -- Create policy for public read access
   CREATE POLICY "Allow public read access"
     ON items FOR SELECT
     USING (true);

   -- Insert demo data from Stage 1
   INSERT INTO items (name, quantity)
   VALUES
     ('Wooden Sword', 1),
     ('Health Potion', 5);
   ```

2. Configure Environment Variables:

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env with your Supabase credentials
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

### Transitioning from Demo Data

Update your data access to use Supabase:

```typescript
// src/api/items.ts
import { supabase } from "../lib/supabase";
import type { GameItem } from "./model";

export async function getItems(): Promise<GameItem[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("Error fetching items:", error);
    // Fallback to demo data if Supabase is not configured
    return DEMO_ITEMS;
  }

  return data;
}
```

### TypeScript Integration

```typescript
export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          created_at: string;
        };
      };
    };
  };
}
```

## Stage 3: Reading with Postgres MCP

Now we'll use MCP tools to analyze our inventory data:

### Supabase MCP Configuration

Add your Supabase configuration, or just copy what's in `mcp.json`

```bash
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_REGION=us-east-1  # Check your project's region in Supabase dashboard
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

List of regions as follows:

us-west-1 - West US (North California)
us-east-1 - East US (North Virginia) - default
us-east-2 - East US (Ohio)
ca-central-1 - Canada (Central)
eu-west-1 - West EU (Ireland)
eu-west-2 - West Europe (London)
eu-west-3 - West EU (Paris)
eu-central-1 - Central EU (Frankfurt)
eu-central-2 - Central Europe (Zurich)
eu-north-1 - North EU (Stockholm)
ap-south-1 - South Asia (Mumbai)
ap-southeast-1 - Southeast Asia (Singapore)
ap-northeast-1 - Northeast Asia (Tokyo)
ap-northeast-2 - Northeast Asia (Seoul)
ap-southeast-2 - Oceania (Sydney)
sa-east-1 - South America (São Paulo)

### Basic Queries

```sql
-- Get total items count
SELECT COUNT(*) FROM items;

-- Get items by quantity (most to least)
SELECT name, quantity
FROM items
ORDER BY quantity DESC;

-- Get items added in last 24 hours
SELECT * FROM items
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Summary Tools

Create MCP tools to analyze:

- Total inventory count
- Items by creation date
- Quantity distribution

### Inventory Analysis

Using MCP, we can create more sophisticated queries:

```sql
-- Item Statistics
SELECT
  COUNT(*) as total_items,
  SUM(quantity) as total_quantity,
  AVG(quantity)::numeric(10,2) as avg_quantity,
  MIN(created_at) as oldest_item,
  MAX(created_at) as newest_item
FROM items;

-- Inventory Timeline
SELECT
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as items_added,
  SUM(quantity) as quantity_added
FROM items
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- Stock Levels
SELECT
  CASE
    WHEN quantity = 0 THEN 'Out of Stock'
    WHEN quantity < 5 THEN 'Low Stock'
    WHEN quantity < 20 THEN 'Medium Stock'
    ELSE 'Well Stocked'
  END as stock_level,
  COUNT(*) as item_count
FROM items
GROUP BY stock_level
ORDER BY item_count DESC;
```

### Real-time Monitoring

Set up continuous monitoring:

```sql
-- Items running low (quantity < 5)
SELECT name, quantity
FROM items
WHERE quantity < 5
ORDER BY quantity;

-- Recent additions (last 24 hours)
SELECT name, quantity, created_at
FROM items
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Most stocked items
SELECT name, quantity
FROM items
ORDER BY quantity DESC
LIMIT 5;
```

These queries form the foundation for our MCP tools, allowing us to:

1. Track inventory health
2. Monitor stock levels
3. Analyze item distribution
4. Identify trends

## Stage 4: Schema Evolution with Supabase MCP

### Adding Rarity System

Use Supabase MCP to implement a comprehensive rarity system:

1. Enable unsafe mode for schema changes:

   ```sql
   -- Schema changes require unsafe mode
   SELECT live_dangerously('database', true);
   ```

2. Define Rarity Enum:

   ```sql
   -- Create enum type for rarity
   CREATE TYPE item_rarity AS ENUM (
     'common',
     'uncommon',
     'rare',
     'epic',
     'legendary'
   );
   ```

3. Add and Populate Rarity:

   ```sql
   -- Add rarity column
   ALTER TABLE items
   ADD COLUMN rarity item_rarity;

   -- Set default rarity for existing items using weighted distribution
   WITH RECURSIVE weighted_rarity AS (
     SELECT unnest(ARRAY[
       'common',
       'uncommon',
       'rare',
       'epic',
       'legendary'
     ]::item_rarity[]) as rarity,
     unnest(ARRAY[
       0.50,  -- 50% chance
       0.25,  -- 25% chance
       0.15,  -- 15% chance
       0.07,  -- 7% chance
       0.03   -- 3% chance
     ]) as weight
   )
   UPDATE items
   SET rarity = (
     SELECT rarity
     FROM weighted_rarity
     WHERE random() <= weight
     ORDER BY weight DESC
     LIMIT 1
   )
   WHERE rarity IS NULL;
   ```

4. Make Rarity Required:

   ```sql
   -- Add NOT NULL constraint
   ALTER TABLE items
   ALTER COLUMN rarity SET NOT NULL;
   ```

5. Return to safe mode:
   ```sql
   -- Re-enable safe mode after schema changes
   SELECT live_dangerously('database', false);
   ```

### Safety Considerations

When using Supabase MCP for schema changes:

1. Always start in safe mode (read-only)
2. Enable unsafe mode only for schema modifications
3. Return to safe mode after changes
4. Use migrations to track changes
5. Test changes in development first

### Error Handling and Fallbacks

Implement robust error handling for schema changes:

1. TypeScript Error Types:

```typescript
// src/api/errors.ts
export type DatabaseError = {
  code: string;
  message: string;
  details?: string;
};

export type ItemOperationResult<T> = {
  data: T | null;
  error: DatabaseError | null;
};
```

2. Graceful Fallbacks:

```typescript
// src/api/items.ts
import { DEMO_ITEMS } from "./dummy";
import { supabase } from "../lib/supabase";
import type { GameItem, ItemOperationResult } from "./model";

export async function getItems(): Promise<ItemOperationResult<GameItem[]>> {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at");

    if (error) {
      console.error("Database error:", error);
      return {
        data: DEMO_ITEMS,
        error: {
          code: error.code,
          message: "Using demo data due to database error",
          details: error.message,
        },
      };
    }

    return { data, error: null };
  } catch (e) {
    console.error("Unexpected error:", e);
    return {
      data: DEMO_ITEMS,
      error: {
        code: "UNEXPECTED_ERROR",
        message: "Using demo data due to unexpected error",
        details: e instanceof Error ? e.message : String(e),
      },
    };
  }
}

export async function addItem(
  item: Omit<GameItem, "id" | "created_at">
): Promise<ItemOperationResult<GameItem>> {
  try {
    const { data, error } = await supabase
      .from("items")
      .insert([item])
      .select()
      .single();

    if (error) {
      if (error.code === "23503") {
        // Foreign key violation
        return {
          data: null,
          error: {
            code: "INVALID_RARITY",
            message: "Invalid rarity value",
            details: error.message,
          },
        };
      }

      return {
        data: null,
        error: {
          code: error.code,
          message: "Failed to add item",
          details: error.message,
        },
      };
    }

    return { data, error: null };
  } catch (e) {
    return {
      data: null,
      error: {
        code: "UNEXPECTED_ERROR",
        message: "Failed to add item due to unexpected error",
        details: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
```

3. React Component Usage:

```typescript
// src/components/Inventory.tsx
import { useEffect, useState } from "react";
import { getItems } from "../api/items";
import type { GameItem } from "../api/model";

export function Inventory() {
  const [items, setItems] = useState<GameItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadItems() {
      const result = await getItems();

      if (result.error) {
        setError(result.error.message);
        setIsDemo(true);
      }

      if (result.data) {
        setItems(result.data);
      }
    }

    loadItems();
  }, []);

  return (
    <div className="inventory">
      {error && <div className="alert alert-warning">{error}</div>}
      {isDemo && (
        <div className="alert alert-info">
          Using demo data - some features may be limited
        </div>
      )}
      <div className="items-grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

This error handling system provides:

1. Type-safe error reporting
2. Graceful fallbacks to demo data
3. Clear user feedback
4. Detailed error logging
5. Recovery strategies

### Testing Schema Changes

Before applying schema changes to production:

1. Test Database Connection:

```sql
-- Verify MCP connection
SELECT current_database(), current_user;

-- Check table existence
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'items'
);
```

2. Test Rarity Enum:

```sql
-- Insert test items with different rarities
INSERT INTO items (name, quantity, rarity) VALUES
  ('Test Common', 1, 'common'),
  ('Test Uncommon', 1, 'uncommon'),
  ('Test Rare', 1, 'rare'),
  ('Test Epic', 1, 'epic'),
  ('Test Legendary', 1, 'legendary');

-- Verify constraints
INSERT INTO items (name, quantity, rarity) VALUES
  ('Invalid Rarity', 1, 'invalid'); -- Should fail

-- Test rarity distribution
SELECT rarity, COUNT(*)
FROM items
GROUP BY rarity
ORDER BY rarity;
```

3. Test Error Handling:

```typescript
// src/tests/items.test.ts
import { getItems, addItem } from "../api/items";

describe("Item Operations", () => {
  test("getItems falls back to demo data on error", async () => {
    // Temporarily break database connection
    process.env.SUPABASE_URL = "invalid-url";

    const result = await getItems();
    expect(result.error).not.toBeNull();
    expect(result.data).toEqual(DEMO_ITEMS);
    expect(result.error?.code).toBe("UNEXPECTED_ERROR");
  });

  test("addItem validates rarity", async () => {
    const result = await addItem({
      name: "Test Item",
      quantity: 1,
      rarity: "invalid" as any,
    });

    expect(result.error).not.toBeNull();
    expect(result.error?.code).toBe("INVALID_RARITY");
  });
});
```

4. Verify UI Feedback:

```typescript
// src/tests/Inventory.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { Inventory } from "../components/Inventory";

test("shows demo data notice on error", async () => {
  // Mock database error
  jest.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

  render(<Inventory />);

  await waitFor(() => {
    expect(screen.getByText(/using demo data/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});
```

5. Migration Verification:

```sql
-- Check migration status
SELECT version, name, applied_at
FROM supabase_migrations.schema_migrations
WHERE name LIKE '%rarity%'
ORDER BY version DESC;

-- Verify no pending migrations
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE applied_at IS NULL;
```

### TypeScript Integration

```typescript
export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          quantity: number;
          created_at: string;
          rarity: string;
        };
      };
    };
  };
}
```

### Rarity Analysis

New MCP queries for rarity insights:

```sql
-- Rarity distribution
SELECT
  rarity,
  COUNT(*) as item_count,
  SUM(quantity) as total_quantity,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM items) * 100, 2) as percentage
FROM items
GROUP BY rarity
ORDER BY
  CASE rarity
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END;

-- High-value items (rare and above)
SELECT name, rarity, quantity
FROM items
WHERE rarity IN ('rare', 'epic', 'legendary')
ORDER BY
  CASE rarity
    WHEN 'rare' THEN 1
    WHEN 'epic' THEN 2
    WHEN 'legendary' THEN 3
  END DESC,
  quantity DESC;

-- Stock alerts by rarity
SELECT
  name,
  rarity,
  quantity,
  CASE
    WHEN quantity = 0 THEN 'Out of Stock'
    WHEN quantity < 5 THEN 'Low Stock'
    ELSE 'OK'
  END as stock_status
FROM items
WHERE quantity < 5 AND rarity IN ('epic', 'legendary')
ORDER BY rarity DESC, quantity;
```

### Migration Management

Supabase MCP automatically versions all schema changes. Each change is tracked with:

1. Timestamp prefix (YYYYMMDDHHMMSS)
2. Descriptive name
3. Up and down migrations

Example migration names for our changes:

```sql
-- Stage 2: Initial Setup
20250319000001_create_items_table

-- Stage 4: Rarity System
20250319000002_create_item_rarity_enum
20250319000003_add_rarity_to_items
20250319000004_populate_item_rarity
20250319000005_make_rarity_required
```

View migrations using MCP:

```sql
-- List all migrations
SELECT version, name, applied_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

-- Check pending migrations
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE applied_at IS NULL;
```

### Learning Outcomes

1. Progressive enhancement approach
2. In-memory to database migration
3. MCP tool usage for database operations
4. Schema evolution best practices

## Video Tutorial

Coming soon! This tutorial will be part of our MCP learning series.
