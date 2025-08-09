const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const SQLiteDatabase = require('./sqliteDatabase');
const AIService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database and AI service
const db = new SQLiteDatabase();
const aiService = new AIService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running with SQLite and OpenAI' });
});

// Test AI connection
app.get('/api/test-gemini', asyncHandler(async (req, res) => {
  const result = await aiService.testConnection();
  res.json(result);
}));

// Get all users for dropdown
app.get('/api/users', asyncHandler(async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
}));

// Process natural language query with OpenAI
app.post('/api/query', asyncHandler(async (req, res) => {
  const { query, userId } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query is required and must be a string'
    });
  }

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  try {
    // Get user context
    const users = await db.getUsers();
    const currentUser = users.find(u => u.id == userId);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get clients for this user
    const userClients = await db.getClientsForUser(userId);

    // Query AI with context
    const aiResponse = await aiService.queryDatabase(query, currentUser, userClients);

    res.json({
      success: true,
      data: {
        query: query,
        user: currentUser.name,
        clientCount: userClients.length,
        answer: aiResponse.success ? aiResponse.answer : aiResponse.fallback,
        openaiUsed: aiResponse.openaiUsed || false,
        error: aiResponse.success ? null : aiResponse.error,
        usage: aiResponse.usage || null
      }
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your query',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get clients for a specific user
app.get('/api/clients/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const clients = await db.getClientsForUser(userId);
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients for user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initializeDatabase();
    
    app.listen(PORT, () => {
      const aiMode = process.env.USE_FREE_TIER === 'true' ? 'Free Tier (Enhanced Fallback)' : 
                    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here' ? 'Google Gemini Enabled' : 'Fallback Only';
      
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Using SQLite Database`);
      console.log(`🤖 AI Mode: ${aiMode}`);
      if (process.env.AI_TIMEOUT_MS) {
        console.log(`⚡ AI Timeout: ${process.env.AI_TIMEOUT_MS}ms`);
      }
      if (process.env.OPTIMIZE_TOKENS === 'true') {
        console.log(`🔧 Token Optimization: Enabled`);
      }
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  try {
    await db.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
