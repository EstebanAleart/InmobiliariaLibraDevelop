const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

// Usar la URL de Neon si está disponible, sino usar la local
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!DATABASE_URL) {
  console.error("❌ Error: No se encontró DATABASE_URL en las variables de entorno")
  console.log("Asegúrate de tener DATABASE_URL configurado en .env.local")
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes("neon.tech") ? { rejectUnauthorized: false } : false,
})

async function setupDatabase() {
  try {
    console.log("🔗 Conectando a la base de datos...")
    console.log(`📍 Host: ${new URL(DATABASE_URL).host}`)
    
    const sqlFile = fs.readFileSync(
      path.join(__dirname, "001-create-properties-schema.sql"),
      "utf8",
    )

    console.log("📝 Ejecutando schema SQL...")
    await pool.query(sqlFile)
    
    // Verificar que las tablas se crearon
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    console.log("\n✅ Database schema setup completed successfully!")
    console.log("\n📊 Tablas creadas:")
    rows.forEach(row => console.log(`   - ${row.table_name}`))
    
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setupDatabase()
