const dotenv = require("dotenv");
dotenv.config();
const { pool } = require("./db");
const bcrypt = require("bcryptjs");

console.log("Config Check:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPass: !!process.env.DB_PASSWORD
});

const seed = async () => {
  try {
    console.log("🌱 Seeding database...");
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("student123", salt);
    const adminPassword = await bcrypt.hash("admin123", salt);

    // Create default users
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('Test Student', 'student@test.com', $1, 'Member'),
        ('Test Admin', 'admin@test.com', $2, 'SuperAdmin')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword, adminPassword]);

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seed();
