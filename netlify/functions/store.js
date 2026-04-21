const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const store = getStore('knyaga-store');

  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get('store', { type: 'json' });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data)
      };
    } catch (e) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(null)
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      await store.setJSON('store', data);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: true })
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      };
    }
  }

  return { statusCode: 405, body: 'Method not allowed' };
};
