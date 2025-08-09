const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    const response = await fetch('http://localhost:3001/api/users');
    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('API Error:', error);
  }
}

testAPI();
