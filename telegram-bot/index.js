const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');  
const {Pool} = require('pg');

const db = new Pool({
    name: 'postgres',
    host: 'localhost',
    database: 'DB',
    password: 'PASSWORD',
    port: 5432
});

const query = (text , params) => db.query(text , params);

const token = 'BOT'; 
const bot = new TelegramBot(token, {
    polling: {
        interval: 3000, 
        autoStart: true, 
        params: {
            timeout: 10
        }
    }
});


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

bot.onText(/\/add (.+)/ , async(msg , Math) => {
    const chatID = msg.chat.id;
    const Text1 = Math[1];

    try{
        await query(`INSERT INTO tasks_1(text , chat_id) VALUES($1 , $2)` , [Text1 , chatID]);
        bot.sendMessage(chatID , `Твое задание ${Text1} успешно запишен`);
    }
    catch(err){
        console.log(err);
        bot.sendMessage(chatID , 'Ошибка при записе твоего задание')
    };
});

bot.onText(/\/tasks/ , async(msg) => {
    const chatID = msg.chat.id;

    try{
        const text2 = await query(`SELECT text FROM tasks_1 WHERE id=$1` , [chatID]);
        if(text2 === 0){
            bot.sendMessage(chatID , 'У вас нету запишенных заданий')
        }
        else{
            bot.sendMessage(chatID , text2);
        }
    }
    catch(err){
        console.log(err);
        bot.sendMessage(chatID , 'Ошибка при получение задач');
    };
});

