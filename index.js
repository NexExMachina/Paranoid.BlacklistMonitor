require('dotenv').config(); // Load environment variables from .env file
const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client({
    intents: [
        1 << 0, // GUILDS
        1 << 9, // GUILD_MESSAGES
        1 << 15, // MESSAGE_CONTENT
    ],
});

let bannedServersList = []; // Stores the currently banned servers

client.login(process.env.DISCORD_BOT_TOKEN).then(() => {
    console.log("Logged in to Discord.");
    console.log("Starting server status checks...");
    setInterval(fetchAndProcessBMData, 60000); // Check every 60 seconds
});


// Create a test server object for a banned server
const testBannedServer = {
    name: "Test Banned Server",
    ip: "192.0.2.1",
    port: "28015"
};

// Send a test webhook notification for a banned server
 sendWebhookNotification(testBannedServer, true); // true indicates the server is banned
// sendWebhookNotification(testBannedServer, false); // true indicates the server is banned

// Define the BM API URL
// const bmApiUrl = process.env.BM_API;
const bmApiUrl = `https://api.battlemetrics.com/servers?filter[organizations]=${process.env.BM_ORG_ID}&page[size]=100`;


// Function to fetch and process data from BM API
function fetchAndProcessBMData() {
    console.log("Fetching data from BM API...");
    axios.get(bmApiUrl)
        .then(response => {
            console.log("Data fetched from BM API. Processing data...");
            const data = response.data.data;
            const serverList = [];

            for(const server of data) {
                const name = server.attributes.name;
                const ip = server.attributes.ip;
                const port = server.attributes.port;

                serverList.push({name, ip, port});
            }

            console.log(serverList)

            // Process each country
            // for (const country in data) {
            //     data[country].forEach(server => {
            //         const name = server.name;
            //         const ip = server.ip;
            //         const port = server.port + 2;
            //
            //         serverList.push({name, ip, port});
            //     });
            // }

            console.log("Checking for banned and unbanned servers...");
            checkBannedServers(serverList);
        })
        .catch(error => {
            console.error('Error fetching data from BM API:', error);
        });
}

// Function to check against FP_BAN_API and list banned servers
function checkBannedServers(serverList) {
    const fpBanApiUrl = process.env.FP_BAN_API;
    console.log("Fetching banned servers list from FP_BAN_API...");

    axios.get(fpBanApiUrl)
        .then(response => {
            console.log("Banned servers list fetched. Comparing with current servers...");
            const bannedIps = response.data.Servers.Banned;
            const currentBannedServers = serverList.filter(server => bannedIps.includes(server.ip));
            const newlyBannedServers = currentBannedServers.filter(server => !bannedServersList.includes(server.ip));
            const newlyUnbannedServers = bannedServersList.filter(ip => !bannedIps.includes(ip));

            newlyBannedServers.forEach(server => {
                console.log(`Newly banned server found: ${server.name}`);
                sendWebhookNotification(server, true); // true for banned
            });

            newlyUnbannedServers.forEach(ip => {
                const server = serverList.find(s => s.ip === ip);
                if (server) {
                    console.log(`Server unbanned: ${server.name}`);
                    sendWebhookNotification(server, false); // false for unbanned
                }
            });

            // Update the banned servers list
            bannedServersList = currentBannedServers.map(server => server.ip);
        })
        .catch(error => {
            console.error('Error fetching data from FP_BAN_API:', error);
        });
}

// Function to send a webhook notification
function sendWebhookNotification(server, isBanned) {
    const webhookUrl = process.env.BAN_WEBHOOK;
    const alertRole = process.env.ALERT_ROLE; // Get ALERT_ROLE from the environment variables
    const color = isBanned ? 0xFF0000 : 0x00FF00; // Red for banned, green for unbanned
    const status = isBanned ? 'banned' : 'unbanned';

    console.log(`Sending ${status} notification for server: ${server.name}`);

    const webhookData = {
        content: `<@&${alertRole}>`, // Use ALERT_ROLE from the environment variables
        embeds: [
            {
                title: `SERVER ${status.toUpperCase()} BY FACEPUNCH`,
                description: `**NAME:** ${server.name}\n**ADDRESS:** ${server.ip}:${server.port}`,
                color: color,
                footer: {
                    text: isBanned
                        ? "Use the /blacklist command in RSO or contact Ali/JakB"
                        : "Please announce on discord Connectivity Issues are resolved"
                }
            },
        ],
        attachments: []
    };

    axios.post(webhookUrl, webhookData)
        .then(() => console.log(`Notification sent for ${status} server: ${server.name}`))
        .catch(error => console.error('Error sending webhook notification:', error));
}