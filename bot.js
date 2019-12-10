const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const parser = require('./parser');

require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;

let bot;

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.PRODUCTION_URL + bot.token);
} else {
    bot = new TelegramBot(token, {polling: true});
}

bot.onText(/\/w (.+)/, (msg, match) => {
    console.log(msg);
    console.log(match);
    const word = match[1];
    axios
        .get(`${process.env.OXFORD_API_URL}/entries/en-gb/${word}`, {
            params: {
                fields: 'definitions',
                strictMatch: 'false'
            },
            headers: {
                app_id: process.env.OXFORD_APP_ID,
                app_key: process.env.OXFORD_APP_KEY
            }
        })
        .then(response => console.log(JSON.stringify(response.data.results)))
        .catch(err => console.log(err));
});