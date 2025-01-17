const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 5000;

// Конфигурация Telegram
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // Токен вашего Telegram-бота
const CHAT_ID = process.env.CHAT_ID; // ID вашей супергруппы (например, -1001234567890)
const THREAD_ID = process.env.THREAD_ID; // ID темы в супергруппе (thread ID)

// Middleware для обработки JSON
app.use(express.json());

// Функция для отправки сообщений в Telegram thread
async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    message_thread_id: THREAD_ID, // Указываем thread ID
    text: message,
    parse_mode: "Markdown",
  };

  try {
    const response = await axios.post(url, payload);
    console.log("Сообщение отправлено в Telegram:", response.data);
  } catch (error) {
    console.error("Ошибка отправки сообщения в Telegram:", error.message);
  }
}

// Маршрут для обработки Webhook от Sentry
app.post("/sentry-webhook", async (req, res) => {
  const data = req.body;

  if (!data) {
    return res.status(400).send("No data received");
  }

  // Форматирование сообщения
  const project = data.project_name || "Unknown Project";
  const level = data.level || "error";
  const message = data.message || "No message";
  const url = data.url || "No URL";

  const telegramMessage = `
⚠️ *Sentry Alert*

*Project:* ${project}
*Level:* ${level}
*Message:* ${message}
[View Issue](${url})
  `;

  // Отправка сообщения в Telegram thread
  await sendTelegramMessage(telegramMessage);

  res.status(200).send("OK");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});