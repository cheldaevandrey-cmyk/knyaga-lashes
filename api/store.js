const BIN_ID = '69e7a963aaba882197222374';
const API_KEY = '$2a$10$UYoa8ByDC93c0ieVn6P09e.AelSPScEGxfXFReTubVAy5cwkMx3v6';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const r = await fetch(`${BIN_URL}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      const json = await r.json();
      return res.status(200).json(json.record ?? null);
    } catch(e) {
      return res.status(200).json(null);
    }
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const r = await fetch(BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify(data)
      });
      const json = await r.json();
      console.log('JSONBin response:', JSON.stringify(json));
      return res.status(200).json({ ok: true });
    } catch(e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
