const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');  

const token = '7530429911:AAGHRQBLM_5XJZ9UpjjUd37MZ26Y-XL8ky0'; 
const bot = new TelegramBot(token, {
    polling: {
        interval: 3000, 
        autoStart: true, 
        params: {
            timeout: 10
        }
    }
});

// Обработчик ошибок polling
bot.on("polling_error", console.log);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привет! Я бот для обработки данных. Я могу показать курсы валют и погоду.");
});

bot.onText(/\/currency/, async (msg) => {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');  
        const rates = response.data.rates;
        bot.sendMessage(msg.chat.id, `Курс доллара: EUR = ${rates.EUR}, RUB = ${rates.RUB}`);
    } catch (error) {
        console.log(error);
        bot.sendMessage(msg.chat.id, 'Ошибка при получении курса валют.');
    }
});
