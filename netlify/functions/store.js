const BIN_ID = '69e7a963aaba882197222374';
const API_KEY = '$2a$10$UYoa8ByDC93c0ieVn6P09e.AelSPScEGxfXFReTubVAy5cwkMx3v6';
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    try {
      const res = await fetch(`${URL}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(json.record ?? null) };
    } catch (e) {
      return { statusCode: 200, headers, body: JSON.stringify(null) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const res = await fetch(URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
