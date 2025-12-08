import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Export the pool as db for backward compatibility
export const db = pool

// Helper function to handle template literals like Neon's sql``
export async function sql<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  // Combine the template strings and values into a single query
  let query = strings[0]
  const params: any[] = []

  for (let i = 1; i < strings.length; i++) {
    params.push(values[i - 1])
    query += `$${i}${strings[i]}`
  }

  try {
    const result = await pool.query(query, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", query, params, error)
    throw error
  }
}
