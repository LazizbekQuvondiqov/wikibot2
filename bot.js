require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const winston = require('winston');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});

// Bot token from .env
const API_TOKEN = process.env.BOT_TOKEN;
if (!API_TOKEN) {
  logger.error("Bot token topilmadi! `.env` faylini tekshiring.");
  process.exit(1);
}

// Create bot instance
const bot = new Telegraf(API_TOKEN);

// Set Wikipedia language to Uzbek
const WIKI_API_URL = 'https://uz.wikipedia.org/api/rest_v1/page/summary/';

// Welcome message for /start and /help commands
bot.command(['start', 'help'], async (ctx) => {
  await ctx.reply("Wikipediya botiga xush kelibsiz!");
});

// Handle text messages
bot.on('text', async (ctx) => {
  try {
    const query = encodeURIComponent(ctx.message.text);
    const response = await axios.get(`${WIKI_API_URL}${query}`);
    
    if (response.data && response.data.extract) {
      await ctx.reply(response.data.extract);
    } else {
      await ctx.reply('Bu mavzuga oid maqola topilmadi.');
    }
  } catch (error) {
    logger.error(`Error fetching Wikipedia data: ${error.message}`);
    await ctx.reply('Bu mavzuga oid maqola topilmadi.');
  }
});

// Start the bot
bot.launch().then(() => {
  logger.info('Bot started');
}).catch((err) => {
  logger.error(`Failed to start bot: ${err}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
