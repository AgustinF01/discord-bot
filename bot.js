require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_USER_ID = process.env.TWITTER_USER_ID;
let lastTweetId = null;

async function getLatestTweet() {
    try {
        const url = `https://api.twitter.com/2/users/${TWITTER_USER_ID}/tweets?max_results=5&tweet.fields=created_at`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
        });

        const tweets = response.data.data;
        if (!tweets || tweets.length === 0) return null;

        const latestTweet = tweets[0];
        if (latestTweet.id === lastTweetId) return null;

        lastTweetId = latestTweet.id;
        return `📢 Nuevo tweet de @usuario:\nhttps://twitter.com/user/status/${latestTweet.id}`;
    } catch (error) {
        console.error("Error obteniendo tweet:", error);
        return null;
    }
}

async function checkTweets() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const tweet = await getLatestTweet();
    if (tweet) channel.send(tweet);
}

client.once("ready", () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    setInterval(checkTweets, 60000); // Verificar cada minuto
});

client.login(process.env.DISCORD_TOKEN);
