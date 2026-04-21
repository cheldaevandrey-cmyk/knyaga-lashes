const { getStore } = require('@netlify/blobs');

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

  let store;
  try {
    store = getStore('knyaga');
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Store init failed: ' + e.message }) };
  }

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get('data', { type: 'json' });
      return { statusCode: 200, headers, body: JSON.stringify(data ?? null) };
    } catch (e) {
      return { statusCode: 200, headers, body: JSON.stringify(null) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      await store.setJSON('data', data);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
