import { mockClients } from '../data/mockData';

class MockNLPParser {
  constructor() {
    this.patterns = [
      {
        pattern: /(?:most recent|latest|newest)\s+client/i,
        handler: () => {
          const sorted = [...mockClients].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return {
            sql: 'SELECT * FROM clients ORDER BY created_at DESC LIMIT 1',
            results: [sorted[0]],
            description: 'Get the most recent client'
          };
        }
      },
      {
        pattern: /(?:oldest|first)\s+client/i,
        handler: () => {
          const sorted = [...mockClients].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          return {
            sql: 'SELECT * FROM clients ORDER BY created_at ASC LIMIT 1',
            results: [sorted[0]],
            description: 'Get the oldest client'
          };
        }
      },
      {
        pattern: /(?:all|list)\s+clients?/i,
        handler: () => {
          const sorted = [...mockClients].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return {
            sql: 'SELECT * FROM clients ORDER BY created_at DESC',
            results: sorted,
            description: 'Get all clients'
          };
        }
      },
      {
        pattern: /client(?:s)?\s+(?:by|with)\s+email\s+([^\s]+)/i,
        handler: (match) => {
          const email = match[1];
          const client = mockClients.find(c => c.email.toLowerCase() === email.toLowerCase());
          return {
            sql: `SELECT * FROM clients WHERE email = '${email}'`,
            results: client ? [client] : [],
            description: 'Get client by email'
          };
        }
      },
      {
        pattern: /client(?:s)?\s+(?:named|called)\s+([^,]+)/i,
        handler: (match) => {
          const name = match[1].trim();
          const clients = mockClients.filter(c => 
            c.name.toLowerCase().includes(name.toLowerCase())
          );
          return {
            sql: `SELECT * FROM clients WHERE name LIKE '%${name}%'`,
            results: clients,
            description: 'Get client by name'
          };
        }
      },
      {
        pattern: /(?:how many|count)\s+clients?/i,
        handler: () => {
          return {
            sql: 'SELECT COUNT(*) as total_clients FROM clients',
            results: [{ total_clients: mockClients.length }],
            description: 'Count total clients'
          };
        }
      }
    ];
  }

  parseQuery(naturalLanguageQuery) {
    const query = naturalLanguageQuery.trim().toLowerCase();
    
    for (const pattern of this.patterns) {
      const match = query.match(pattern.pattern);
      if (match) {
        const result = pattern.handler(match);
        return {
          ...result,
          originalQuery: naturalLanguageQuery,
          count: result.results.length
        };
      }
    }
    
    return null;
  }
}

export default new MockNLPParser();
