# Game Inventory Management with Supabase and MCP

This lesson demonstrates how to create a game inventory management system using Supabase as the backend and MCP for database operations. You'll learn how to integrate Supabase with MCP, handle database operations, and create a game-themed UI.

## Video

Coming Soon

## Project Overview

We'll build a game inventory system where players can:
- View their inventory items
- Add new items
- Update item quantities
- Delete items

## Project Structure

```
lesson3/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── styles/      # CSS styles
│   │   └── mcp/         # MCP client setup
├── server/              # MCP server implementations
│   ├── manual/         # Manual Supabase integration
│   └── tool/          # Using supabase-mcp-server
└── supabase/          # Supabase schema and setup
```

## Part 1: Setting Up Supabase

1. Create a Supabase project
2. Set up the database schema:
   ```sql
   create table items (
     id uuid default uuid_generate_v4() primary key,
     name text not null,
     quantity integer not null,
     rarity text not null,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```

## Part 2: Manual Integration

### Frontend Setup
1. Create a React app with game-themed UI
2. Implement inventory display grid
3. Add item management forms

### MCP Server (Manual)
1. Set up PostgREST client
2. Implement MCP tools:
   - `listItems`: Fetch all inventory items
   - `addItem`: Add new item
   - `updateQuantity`: Update item quantity
   - `deleteItem`: Remove item

## Part 3: Using supabase-mcp-server

1. Install and configure supabase-mcp-server
2. Connect to your Supabase project
3. Use pre-built MCP tools for database operations

## Interactive Exercises

### 1. Manual Database Operations
- Create an inventory item through Supabase UI
- Query items using PostgREST
- Update quantities manually
- Observe changes in the UI

### 2. MCP Tool Integration
- Use MCP tools to perform the same operations
- Compare manual vs MCP approach
- Test error handling and validation

### 3. UI Interactions
- Add new items with rarity levels
- Update quantities with animations
- Delete items with confirmation
- Filter and sort inventory

## Key Concepts

- **Supabase Integration**: Database setup and REST API
- **MCP Tools**: Database operation abstractions
- **Real-time Updates**: Live inventory changes
- **Error Handling**: Validation and user feedback

## Debugging Tips

1. Use Supabase Dashboard for:
   - Database inspection
   - Query performance
   - API logs

2. Chrome DevTools for:
   - Network requests
   - React component debugging
   - State management

## Next Steps

- Add authentication
- Implement inventory categories
- Add item trading between players
- Set up real-time notifications

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [supabase-mcp-server](https://github.com/alexander-zuev/supabase-mcp-server)
- [PostgREST API Reference](https://postgrest.org/en/stable/api.html)
- [Model Context Protocol](https://modelcontextprotocol.io)
