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
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    // Switching on data directly
    switch (data) {
        case 'sell':
            bot.sendMessage(chatId, "You don't have any trade yet!");
            break;
        case 'buy':
            bot.sendMessage(chatId, "Enter a token symbol or address to buy");
            break;
        case 'positions':
            bot.sendMessage(chatId, "Enter the token address to check position for");
            break;
        case 'copy_trade':
            bot.sendMessage(chatId, "Enter the token address to copy trade");
            break;
        case 'withdraw':
            bot.sendMessage(chatId, "Enter the address where you want to withdraw");
            break;
        case 'refresh':
            bot.sendMessage(chatId, "Refreshing");
            break;
        case 'autosell':
            bot.sendMessage(chatId, "Autosell option:");
            break;
        default:
            // Handling other cases if needed
            break;
    }
});
