export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { answers } = req.body;
    const answersText = answers.map((a, i) => `${i+1}. ${a.question} → ${a.answer}`).join('\n');

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Ты эксперт салона Knyaga Lashes. Клиентка ответила:\n${answersText}\n\nВыбери ОДНУ процедуру:\n- Классика\n- 2D объём\n- 3D объём\n- 4D объём\n- Виспи / Аниме\n- Ламинирование ресниц\n- Ламинирование бровей\n\nОтветь только JSON:\n{"procedure":"название","emoji":"эмодзи","personal":"2 предложения почему эта процедура подходит ей"}`
        }]
      })
    });

    const rawText = await anthropicRes.text();
    console.log('Anthropic status:', anthropicRes.status);
    console.log('Anthropic response:', rawText.substring(0, 500));

    if (!anthropicRes.ok) {
      return res.status(500).json({ error: 'Anthropic error: ' + rawText.substring(0, 200) });
    }

    const data = JSON.parse(rawText);
    const text = data.content?.[0]?.text || '';
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(result);
  } catch(e) {
    console.error('Quiz error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
