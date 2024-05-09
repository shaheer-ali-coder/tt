const keyboard_ = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'Sell', callback_data: 'sell' },
                { text: 'Buy', callback_data: 'buy' }
            ],
            [
                { text: 'Positions', callback_data: 'positions' },
                { text: 'Copy trade', callback_data: 'copy_trade' }
            ],
            [
                { text: 'Withdraw', callback_data: 'withdraw' },
                { text: 'Refresh', callback_data: 'refresh' }
            ],
            [
                { text: 'Autosell', callback_data: 'autosell' }
            ]
        ]
    }
};
const TelegramBot = require('node-telegram-bot-api');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = '7012596625:AAFEEtJVLS03MKpXbW5jz2LQe5EkuDgA20k';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const response = "Follow the White Rabbit";
    
    // Send the response
    bot.sendMessage(chatId, response,{parse_mode:"HTML",...keyboard_});
});
