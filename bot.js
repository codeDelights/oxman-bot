const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const parser = require('./parser.js');

const express = require('express')
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

const token = process.env.TELEGRAM_TOKEN;

let bot;

app.use(bodyParser.json());


if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.PRODUCTION_URL + bot.token);
} else {
    bot = new TelegramBot(token, {polling: true});
}

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
 
app.listen(process.env.PORT);

bot.onText(/(.+)/, (msg, match) => {
    console.log(msg);
    /* console.log(match); */
    const word = match[1];
    const chatId = msg.chat.id;
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
        .then(response => {
            const parsedHtml = parser(response.data);
            bot.sendMessage(chatId, parsedHtml, { parse_mode: 'HTML' });
        })
        .catch(error => {
            const errorText = error.response.status === 404 ? `No definition found for the word: <b>${word}</b>` : `<b>An error occured, please try again later</b>`;
            bot.sendMessage(chatId, errorText, { parse_mode:'HTML'})
        });
});