const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const BIN_ID = '69e7a963aaba882197222374';
const API_KEY = '$2a$10$INS.MvzJLOTR19Lc3.hiJuGm.RQ7xeA323aNp2ZOAvGlPzSKViuEW';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function getStore() {
  const r = await fetch(`${BIN_URL}/latest`, { headers: { 'X-Master-Key': API_KEY } });
  const json = await r.json();
  return json.record;
}

async function saveStore(data) {
  await fetch(BIN_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
    body: JSON.stringify(data)
  });
}

async function sendMessage(chat_id, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' })
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).end();

    const chat_id = message.chat.id;
    const text = message.text;

    // /start booking_ID_DATE_TIME_NAME
    if (text.startsWith('/start booking_')) {
      const parts = text.replace('/start booking_', '').split('_');
      const bookingId = parts[0];
      const date = parts[1];
      const time = parts[2] ? parts[2].slice(0,2) + ':' + parts[2].slice(2) : '';
      const name = parts[3] ? decodeURIComponent(parts[3]) : '';

      const store = await getStore();
      const booking = store.bookings?.find(b => b.id === bookingId);

      if (booking) {
        // Save chat_id to booking
        booking.tgChatId = chat_id;
        await saveStore(store);

        await sendMessage(chat_id, `🌸 <b>Привет, ${name}!</b>\n\nТы подписалась на напоминание о записи:\n📅 <b>${date}</b> в <b>${time}</b>\n\nЯ напомню тебе за 24 часа 🔔`);
      } else {
        await sendMessage(chat_id, `🌸 Привет! Напоминание активировано. Я сообщу тебе о записи!`);
      }
    } else {
      await sendMessage(chat_id, `🌸 Привет! Я бот Knyaga Lashes. Записывайся на сайте и нажимай «Подписаться» для напоминаний!`);
    }

    return res.status(200).json({ ok: true });
  } catch(e) {
    console.error('Bot error:', e.message);
    return res.status(200).end();
  }
}
