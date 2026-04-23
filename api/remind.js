const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const BIN_ID = '69e7a963aaba882197222374';
const API_KEY = '$2a$10$INS.MvzJLOTR19Lc3.hiJuGm.RQ7xeA323aNp2ZOAvGlPzSKViuEW';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateRu(dk) {
  const [y,m,d] = dk.split('-').map(Number);
  const date = new Date(y, m-1, d);
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const days = ['вс','пн','вт','ср','чт','пт','сб'];
  return `${date.getDate()} ${months[date.getMonth()]}, ${days[date.getDay()]}`;
}

async function sendMessage(chat_id, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
  });
}

export default async function handler(req, res) {
  try {
    const r = await fetch(`${BIN_URL}/latest`, { headers: { 'X-Master-Key': API_KEY } });
    const json = await r.json();
    const store = json.record;

    if (!store || !store.bookings) return res.status(200).json({ ok: true, sent: 0 });

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = dateKey(tomorrow);

    const bookings = store.bookings.filter(b =>
      b.status === 'active' &&
      b.date === tomorrowKey &&
      b.tgChatId
    );

    console.log(`Remind: checking ${tomorrowKey}, found ${bookings.length} bookings with tgChatId`);

    for (const b of bookings) {
      await sendMessage(b.tgChatId,
        `🔔 <b>Напоминание о записи!</b>\n\n` +
        `Привет, ${b.name}! Завтра у тебя запись:\n` +
        `📅 <b>${formatDateRu(b.date)}</b> в <b>${b.time}</b>\n` +
        `💅 <b>${b.serviceName}</b>\n\n` +
        `Ждём тебя! 🌸 — Knyaga Lashes`
      );
    }

    return res.status(200).json({ ok: true, sent: bookings.length });
  } catch(e) {
    console.error('Remind error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
