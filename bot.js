import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs/promises';
import dotenv from 'dotenv/config';
import express from 'express';

// Create Express app
const app = express();

// Define a simple route
app.get('/', (req, res) => {
  res.send('Discord Bot Server');
});

// Start the server
const PORT = 8070;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    startSendingQuestions(CHANNEL_ID);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Testing bot before sending questions.');
    }
});

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const startSendingQuestions = async (channelId) => {
    try {
        const data = await fs.readFile('questions.json', 'utf8');
        const questions = JSON.parse(data);

        shuffleArray(questions);

        let questionIndex = 0;

        const sendNextQuestion = async () => {
            if (questionIndex < questions.length) {
                const channel = await client.channels.fetch(channelId);
                const questionObj = questions[questionIndex];

                const messageContent = questionObj.question;
                await channel.send(messageContent);

                questionIndex++;
            } else {
                console.log('All questions have been sent.');
                clearInterval(questionInterval);
            }
        };

        await sendNextQuestion();

        const questionInterval = setInterval(sendNextQuestion, 86400000); // 24 hrs in miliseconds
    } catch (error) {
        console.error('Error reading or sending questions:', error);
    }
};

client.login(TOKEN);
