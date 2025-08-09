import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const QueryInterface = () => {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userClients, setUserClients] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadUserClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      console.log('Attempting to load users from:', 'http://localhost:3001/api/users');
      const response = await apiService.getUsers();
      console.log('Users response:', response);
      if (response.success) {
        setUsers(response.data);
        if (response.data.length > 0) {
          setSelectedUser(response.data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users: ' + error.message);
    }
  };

  const loadUserClients = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await apiService.getClientsForUser(selectedUser);
      if (response.success) {
        setUserClients(response.data);
      }
    } catch (error) {
      console.error('Failed to load user clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !selectedUser) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await apiService.processQuery(query.trim(), selectedUser);
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setResults(null);
    setError(null);
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="results-container">
        <div className="results-header">
          <h3>AI response</h3>
          <span className="results-count">
            {results.clientCount} clients you have
          </span>
        </div>
        
        <div className="ai-response">
          <div className="response-content">
            {results.answer}
          </div>
          
          {results.geminiUsed && (
            <div className="ai-badge">
          
            </div>
          )}
          
          {!results.geminiUsed && results.error && (
            <div className="fallback-notice">
              ai not avaliable
            </div>
          )}
        </div>

        <div className="query-context">
          <strong>Query:</strong> "{results.query}"<br/>
          <strong>User:</strong> {results.user}
        </div>
      </div>
    );
  };

  const selectedUserData = users.find(u => u.id.toString() === selectedUser);

  return (
    <div className="query-wrapper">
      <div className="card">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="userSelect">choose user</label>
            <select
              id="userSelect"
              className="form-control"
              value={selectedUser}
              onChange={handleUserChange}
              required
            >
              <option value="">choose user </option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {selectedUserData && (
            <div className="user-context">
              <strong>user you have chosen :</strong> {selectedUserData.name}<br/>
              <strong>No of clients you have access to :</strong> {userClients.length}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="query">ask here</label>
              <textarea
                id="query"
                className="form-control textarea"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="type here"
                rows="4"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !query.trim() || !selectedUser}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  analyzing
                </>
              ) : (
                'Ask AI Assistant'
              )}
            </button>
          </form>
        </div>

        {selectedUser && userClients.length > 0 && (
          <div className="client-preview">
            <h4>your clients</h4>
            <div className="client-list-compact">
              {userClients.map(client => (
                <div key={client.id} className="client-summary">
                  <span className="client-name">{client.company}</span>
                  <span className="client-meta">
                    {client.industry} • ${client.value?.toLocaleString() || '0'} • {client.access_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {results && renderResults()}
      </div>
    </div>
  );
};

export default QueryInterface;
