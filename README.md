# Database NLP 


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

## 🔍 How it Works

1. **User Input**: User types a natural language query in the React frontend
2. **API Request**: Frontend sends the query to the backend via REST API
3. **NLP Processing**: Backend uses pattern matching to convert natural language to SQL
4. **Query Execution**: Generated SQL is executed against the MySQL database
5. **Response**: Results are sent back to frontend and displayed in a table format

## 📄 License

MIT License - see LICENSE file for details
