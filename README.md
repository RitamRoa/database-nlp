# Database NLP System

A full-stack application that converts natural language queries into SQL and executes them against a MySQL database.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone and setup:**

   ```bash
   # Run the automated setup script
   ./setup.sh
   ```

   Or manually:

   ```bash
   # Install all dependencies
   npm run install-all

   # Setup database
   npm run setup-db
   ```

2. **Configure database:**

   - Update `server/.env` with your MySQL credentials
   - Default settings work for local MySQL with no password

3. **Start the application:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    SQL    ┌─────────────────┐
│   React.js      │◄────────────────│   Node.js       │◄──────────│     MySQL       │
│   Frontend      │                 │   Express       │           │   Database      │
│                 │                 │   Backend       │           │                 │
│ • Query Input   │                 │ • NLP Parser    │           │ • clients table│
│ • Results View  │                 │ • SQL Generator │           │ • Sample data   │
│ • Client Mgmt   │                 │ • Error Handler │           │                 │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
```

## 🗣️ Natural Language Queries

The system supports these types of queries:

| Query Type          | Examples                              | Generated SQL                                              |
| ------------------- | ------------------------------------- | ---------------------------------------------------------- |
| **Latest records**  | "most recent client", "latest client" | `SELECT * FROM clients ORDER BY created_at DESC LIMIT 1`   |
| **All records**     | "all clients", "list clients"         | `SELECT * FROM clients ORDER BY created_at DESC`           |
| **Search by email** | "client by email john@example.com"    | `SELECT * FROM clients WHERE email = ?`                    |
| **Search by name**  | "client named John"                   | `SELECT * FROM clients WHERE name LIKE ?`                  |
| **Count records**   | "how many clients"                    | `SELECT COUNT(*) as total_clients FROM clients`            |
| **Time filters**    | "clients created today"               | `SELECT * FROM clients WHERE DATE(created_at) = CURDATE()` |
| **Oldest records**  | "oldest client"                       | `SELECT * FROM clients ORDER BY created_at ASC LIMIT 1`    |

## 📁 Project Structure

```
database-nlp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── QueryInterface.js
│   │   │   └── ClientManager.js
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── App.js         # Main app component
│   │   └── App.css        # Styles
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── database.js        # Database connection & setup
│   ├── nlpParser.js       # Natural language processing
│   ├── index.js           # Express server
│   ├── .env              # Environment variables
│   └── package.json
│
├── setup.sh              # Automated setup script
├── setup-database.js     # Database initialization
└── package.json          # Root package.json
```

## 🔧 API Endpoints

### Query Processing

- `POST /api/query` - Process natural language query
  ```json
  {
    "query": "most recent client"
  }
  ```

### Client Management

- `GET /api/clients` - Get all clients
- `POST /api/clients` - Add new client
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### System

- `GET /api/health` - Health check
- `GET /api/supported-queries` - Get supported query patterns

## 🗄️ Database Schema

```sql
CREATE TABLE clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Development

### Start development servers:

```bash
npm run dev          # Both frontend and backend
npm run server       # Backend only (port 5000)
npm run client       # Frontend only (port 3000)
```

### Database management:

```bash
npm run setup-db     # Initialize/reset database
```

### Build for production:

```bash
npm run build        # Build React app for production
```

## 🔍 How it Works

1. **User Input**: User types a natural language query in the React frontend
2. **API Request**: Frontend sends the query to the backend via REST API
3. **NLP Processing**: Backend uses pattern matching to convert natural language to SQL
4. **Query Execution**: Generated SQL is executed against the MySQL database
5. **Response**: Results are sent back to frontend and displayed in a table format

## 🛠️ Extending the System

### Adding New Query Patterns

Edit `server/nlpParser.js` and add new patterns:

```javascript
{
  pattern: /your regex pattern/i,
  sql: 'YOUR SQL QUERY',
  description: 'Description of what this does',
  hasParams: true, // if query needs parameters
  paramExtractor: (match) => [match[1]] // extract params from regex match
}
```

### Adding New Database Tables

1. Update `server/database.js` to create new tables
2. Add new API endpoints in `server/index.js`
3. Update the NLP parser with new patterns
4. Create new React components for the frontend

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **Parameterized Queries**: SQL injection prevention through prepared statements
- **CORS Protection**: Configured for specific origins
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **Helmet.js**: Security headers for Express.js

## 🐛 Troubleshooting

### Common Issues:

1. **MySQL Connection Failed**

   - Check if MySQL is running: `brew services start mysql` (macOS)
   - Verify credentials in `server/.env`
   - Ensure MySQL user has database creation permissions

2. **Port Already in Use**

   - Change ports in `server/.env` (backend) or `client/package.json` (frontend)

3. **Dependencies Issues**

   - Delete `node_modules` and run `npm run install-all`

4. **Database Not Found**
   - Run `npm run setup-db` to recreate the database

## 📊 Sample Data

The system comes with sample clients:

- John Doe (john.doe@example.com)
- Jane Smith (jane.smith@example.com)
- Bob Johnson (bob.johnson@example.com)
- Alice Brown (alice.brown@example.com)
- Charlie Wilson (charlie.wilson@example.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
