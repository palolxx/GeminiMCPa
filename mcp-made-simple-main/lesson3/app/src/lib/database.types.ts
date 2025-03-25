// Type for JSON data in Postgres
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database interface for type-safe Supabase operations.
 * This matches our Postgres schema and provides TypeScript 
 * types for all our database operations.
 */
export interface Database {
  public: {
    Tables: {
      items: {
        // What we get back from a SELECT query
        Row: {
          id: string
          name: string
          quantity: number
          created_at: string
        }
        // What we can INSERT - notice id and created_at are optional
        // as they have default values in Postgres
        Insert: {
          id?: string
          name: string
          quantity: number
          created_at?: string
        }
        // What we can UPDATE - all fields are optional
        Update: {
          id?: string
          name?: string
          quantity?: number
          created_at?: string
        }
      }
    }
  }
}
