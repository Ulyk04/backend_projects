const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');  
const {Pool} = require('pg');

const db = new Pool({
    name: 'name',
    host: 'localhost',
    database: 'DB',
    password: 'PASSWORD',
    port: 5432
});


db.connect((err) => {
    if(err){
        console.log('Error on connection with database' , err);
    }
    else{
        console.log('Succefully connected with database');
    }
});

const token = 'TOKEN'; 
const bot = new TelegramBot(token, {
    polling: {
        interval: 3000, 
        autoStart: true, 
        params: {
            timeout: 10
        }
    }
});




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

bot.onText(/\/add (.+)/ , async(msg , match) => {
    const chatID = msg.chat.id;
    const Text1 = match[1];

    try{
        const insert = await db.query('INSERT INTO tasks_1(text , chat_id) VALUES($1 , $2) RETURNING *' , [Text1 , chatID]);
        console.log('Result of adding' , insert);
        bot.sendMessage(chatID , `Твое задание ${Text1} успешно запишен`);
    }
    catch(err){
        console.log(err);
        bot.sendMessage(chatID , 'Ошибка при записе твоего задание')
    };
});

bot.onText(/\/tasks/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        
        const res = await db.query('SELECT text FROM tasks_1 WHERE chat_id = $1', [chatId]);
        
        console.log('Result of request ' , res);

        if (!res || !res.rows || res.rows.length === 0) {
            bot.sendMessage(chatId, 'У вас пока нет задач.');
        } else {
            const taskList = res.rows.map((rows, index) => `${index + 1}. ${rows.text}`).join('\n');
            bot.sendMessage(chatId, `Ваши задачи:\n${taskList}`);
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Ошибка при получении списка задач.');
    }
});

bot.onText(/\/check_tasks/, async (msg) => {
    try {
        const res = await db.query('SELECT * FROM tasks_1');
        console.log('All tasks:', res);

       
        if (res.rows.length === 0) {
            bot.sendMessage(msg.chat.id, 'У вас пока нет задач.');
        } else {
            
            const taskList = res.rows.map(task => task.text).join('\n');
            bot.sendMessage(msg.chat.id, `Ваши задачи:\n${taskList}`);
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, 'Ошибка при получении списка задач.');
    }
});



bot.onText(/\/news/ , async(msg) => {
    const api_news = 'API KEY';
    const chatID = msg.chat.id;

    try{
        const response = await axios(`https://newsapi.org/v2/everything?q=finance&apiKey=${api_news}`);
        const article = response.data.articles;

        if(article.length === 0){
            bot.sendMessage(chatID , 'Пока нету новостей');
        }
        else{
            article.forEach(articles => {
                bot.sendMessage(chatID , `*${articles.title}*\n${articles.url}`, { parse_mode: 'Markdown' });
            });
        }
    }
    catch(err){
        console.log(err);
        bot.sendMessage(chatID , 'Ошибка при получение новостей');
    }
})

bot.onText(/\/capital/ , async(msg) => {
    const chatID = msg.chat.id;
    bot.sendMessage(chatID , 'Напишите пожалуйста название страны, столицу которую вы хотите получить на английском');

    bot.once('message' , async(response) => {
        const capital = response.text;
        try{
            const capitalname = await axios.get(`https://restcountries.com/v3.1/name/${capital}`);
            const names = capitalname.data[0].capital[0];
            bot.sendMessage(chatID , `Столица страны ${capital} это ${names}`);
        }
        catch(err){
            console.log(err);
            bot.sendMessage(chatID , 'Ошибка при получение столицы');
        }
    })
})

bot.on("polling_error", console.log);
