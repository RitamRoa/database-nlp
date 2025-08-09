const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteDatabase {
  constructor() {
    const dbPath = path.join(__dirname, 'database.sqlite');
    this.db = new sqlite3.Database(dbPath);
    console.log('Connected to SQLite database at:', dbPath);
  }

  async initializeDatabase() {
    try {
      // Create tables
      await this.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'User',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          company TEXT,
          industry TEXT,
          status TEXT DEFAULT 'active',
          value INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_contact DATETIME
        )
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS user_clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          access_level TEXT DEFAULT 'read',
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (client_id) REFERENCES clients (id),
          UNIQUE(user_id, client_id)
        )
      `);

      // Insert sample data
      await this.insertSampleData();
      
      console.log('Database initialized with comprehensive sample data');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Closed the database connection.');
        resolve();
      });
    });
  }

  // Get all users
  async getUsers() {
    return this.query('SELECT * FROM users ORDER BY name');
  }

  // Get clients for a specific user
  async getClientsForUser(userId) {
    return this.query(`
      SELECT c.*, uc.access_level, uc.assigned_at
      FROM clients c
      JOIN user_clients uc ON c.id = uc.client_id
      WHERE uc.user_id = ?
      ORDER BY c.name
    `, [userId]);
  }

  // Get all clients (for admin or OpenAI context)
  async getAllClients() {
    return this.query('SELECT * FROM clients ORDER BY created_at DESC');
  }

  // Search clients with context for OpenAI
  async searchClientsWithContext(userId, searchTerm = '') {
    const clients = await this.query(`
      SELECT c.*, uc.access_level, u.name as user_name
      FROM clients c
      JOIN user_clients uc ON c.id = uc.client_id
      JOIN users u ON uc.user_id = u.id
      WHERE uc.user_id = ? 
      AND (c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ?)
      ORDER BY c.name
    `, [userId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

    return clients;
  }

  async insertSampleData() {
    try {
      // Check if data already exists
      const userCount = await this.query('SELECT COUNT(*) as count FROM users');
      if (userCount[0].count > 0) {
        console.log('Sample data already exists');
        return;
      }

      // Insert 5 users with simplified structure
      const users = [
        { name: 'User 1', email: 'user1@company.com', role: 'Manager' },
        { name: 'User 2', email: 'user2@company.com', role: 'Sales Rep' },
        { name: 'User 3', email: 'user3@company.com', role: 'Support' },
        { name: 'User 4', email: 'user4@company.com', role: 'Sales Rep' },
        { name: 'User 5', email: 'user5@company.com', role: 'Admin' }
      ];

      for (const user of users) {
        await this.run(
          'INSERT INTO users (name, email, role, created_at) VALUES (?, ?, ?, ?)',
          [user.name, user.email, user.role, '2025-07-28 10:00:00']
        );
      }

      // Insert 20 clients from various industries
      const clients = [
        { name: 'Client 1', email: 'client1@company.com', phone: '+91 1234567890', company: 'Company 1', industry: 'Technology', status: 'active', value: 150000 },
        { name: 'Client 2', email: 'client2@company.com', phone: '+91 1234567890', company: 'Company 2', industry: 'Software', status: 'active', value: 85000 },
        { name: 'Client 3', email: 'client3@company.com', phone: '+91 1234567890', company: 'Company 3', industry: 'Manufacturing', status: 'active', value: 320000 },
        { name: 'Client 4', email: 'client4@company.com', phone: '+91 1234567890', company: 'Company 4', industry: 'Healthcare', status: 'active', value: 95000 },
        { name: 'Client 5', email: 'client5@company.com', phone: '+91 1234567890', company: 'Company 5', industry: 'Finance', status: 'active', value: 220000 },
        { name: 'Client 6', email: 'client6@company.com', phone: '+91 1234567890', company: 'Company 6', industry: 'Retail', status: 'active', value: 45000 },
        { name: 'Client 7', email: 'client7@company.com', phone: '+91 1234567890', company: 'Company 7', industry: 'Construction', status: 'active', value: 180000 },
        { name: 'Client 8', email: 'client8@company.com', phone: '+91 1234567890', company: 'Company 8', industry: 'Education', status: 'active', value: 65000 },
        { name: 'Client 9', email: 'client9@company.com', phone: '+91 1234567890', company: 'Company 9', industry: 'Transportation', status: 'active', value: 110000 },
        { name: 'Client 10', email: 'client10@company.com', phone: '+91 1234567890', company: 'Company 10', industry: 'Agriculture', status: 'active', value: 75000 },
        { name: 'Client 11', email: 'client11@company.com', phone: '+91 1234567890', company: 'Company 11', industry: 'Media', status: 'active', value: 55000 },
        { name: 'Client 12', email: 'client12@company.com', phone: '+91 1234567890', company: 'Company 12', industry: 'Consulting', status: 'active', value: 135000 },
        { name: 'Client 13', email: 'client13@company.com', phone: '+91 1234567890', company: 'Company 13', industry: 'Energy', status: 'active', value: 290000 },
        { name: 'Client 14', email: 'client14@company.com', phone: '+91 1234567890', company: 'Company 14', industry: 'Hospitality', status: 'active', value: 80000 },
        { name: 'Client 15', email: 'client15@company.com', phone: '+91 1234567890', company: 'Company 15', industry: 'Automotive', status: 'active', value: 125000 },
        { name: 'Client 16', email: 'client16@company.com', phone: '+91 1234567890', company: 'Company 16', industry: 'Pharmaceuticals', status: 'active', value: 200000 },
        { name: 'Client 17', email: 'client17@company.com', phone: '+91 1234567890', company: 'Company 17', industry: 'Real Estate', status: 'inactive', value: 0 },
        { name: 'Client 18', email: 'client18@company.com', phone: '+91 1234567890', company: 'Company 18', industry: 'Food & Beverage', status: 'active', value: 90000 },
        { name: 'Client 19', email: 'client19@company.com', phone: '+91 1234567890', company: 'Company 19', industry: 'Insurance', status: 'active', value: 165000 },
        { name: 'Client 20', email: 'client20@company.com', phone: '+91 1234567890', company: 'Company 20', industry: 'Fashion', status: 'active', value: 40000 }
      ];

      for (const client of clients) {
        await this.run(
          'INSERT INTO clients (name, email, phone, company, industry, status, value, last_contact, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [client.name, client.email, client.phone, client.company, client.industry, client.status, client.value, '2025-07-28 10:00:00', '2025-07-28 10:00:00']
        );
      }

      // Create user-client relationships with shared clients
      const relationships = [
        // User 1 - Has access to high-value clients
        { user_id: 1, client_id: 1, access_level: 'full' },   // Client 1
        { user_id: 1, client_id: 3, access_level: 'full' },   // Client 3  
        { user_id: 1, client_id: 5, access_level: 'full' },   // Client 5
        { user_id: 1, client_id: 13, access_level: 'full' },  // Client 13
        { user_id: 1, client_id: 16, access_level: 'full' },  // Client 16
        { user_id: 1, client_id: 19, access_level: 'read' },  // Client 19

        // User 2 - Mixed portfolio
        { user_id: 2, client_id: 1, access_level: 'read' },   // Client 1 (shared)
        { user_id: 2, client_id: 2, access_level: 'full' },   // Client 2
        { user_id: 2, client_id: 7, access_level: 'full' },   // Client 7
        { user_id: 2, client_id: 9, access_level: 'full' },   // Client 9
        { user_id: 2, client_id: 12, access_level: 'full' },  // Client 12
        { user_id: 2, client_id: 15, access_level: 'full' },  // Client 15

        // User 3 - Support focused
        { user_id: 3, client_id: 4, access_level: 'full' },   // Client 4
        { user_id: 3, client_id: 6, access_level: 'full' },   // Client 6
        { user_id: 3, client_id: 8, access_level: 'full' },   // Client 8
        { user_id: 3, client_id: 10, access_level: 'full' },  // Client 10
        { user_id: 3, client_id: 14, access_level: 'full' },  // Client 14
        { user_id: 3, client_id: 18, access_level: 'full' },  // Client 18

        // User 4 - New prospects
        { user_id: 4, client_id: 11, access_level: 'full' },  // Client 11
        { user_id: 4, client_id: 17, access_level: 'full' },  // Client 17
        { user_id: 4, client_id: 20, access_level: 'full' },  // Client 20
        { user_id: 4, client_id: 3, access_level: 'read' },   // Client 3 (shared)
        { user_id: 4, client_id: 5, access_level: 'read' },   // Client 5 (shared)

        // User 5 - Oversight of all
        { user_id: 5, client_id: 1, access_level: 'read' },   // Client 1 (shared)
        { user_id: 5, client_id: 3, access_level: 'read' },   // Client 3 (shared)
        { user_id: 5, client_id: 5, access_level: 'read' },   // Client 5 (shared)
        { user_id: 5, client_id: 13, access_level: 'read' },  // Client 13 (shared)
        { user_id: 5, client_id: 16, access_level: 'read' },  // Client 16 (shared)
        { user_id: 5, client_id: 19, access_level: 'full' },  // Client 19
      ];

      for (const rel of relationships) {
        await this.run(
          'INSERT INTO user_clients (user_id, client_id, access_level, assigned_at) VALUES (?, ?, ?, ?)',
          [rel.user_id, rel.client_id, rel.access_level, '2025-07-28 10:00:00']
        );
      }

      console.log('✅ Inserted 5 users, 20 clients, and configured shared access relationships');
    } catch (error) {
      console.error('Error inserting sample data:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = SQLiteDatabase;
