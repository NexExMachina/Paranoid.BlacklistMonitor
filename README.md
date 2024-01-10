# Discord Bot for Server Monitoring

This Discord bot is designed to monitor game servers, specifically using the BattleMetrics API for data related to server status. It identifies changes in server statuses (such as bans) and sends notifications to a Discord channel. The bot is built using Node.js and Discord.js.

## Configuration

To configure the bot, set up the following environment variables. These can be stored in a `.env` file at the root of your project.

### Environment Variables

```plaintext
DISCORD_BOT_TOKEN=your_discord_bot_token_here
BM_ORG_ID=your_battlemetrics_org_id_here
FP_BAN_API=https://api.facepunch.com/api/public/manifest/?public_key=j0VF6sNnzn9rwt9qTZtI02zTYK8PRdN1
BAN_WEBHOOK=your_discord_webhook_url_here
ALERT_ROLE=discord_role_id_for_alerts
```

## Functions

### `fetchAndProcessBMData`

Fetches data related to servers from the BattleMetrics API using the organization ID. It processes this data to create a list of servers with their details.

### `checkBannedServers`

Checks the server list against banned server IPs obtained from the Facepunch API. It identifies newly banned and unbanned servers, updating the internal list accordingly.

### `sendWebhookNotification`

Sends a notification to a specified Discord channel via a webhook. Notifications include server details and their banned/unbanned status, tagging a designated role based on the `ALERT_ROLE`.

## Setup and Installation

1. Clone the repository to your local machine.
2. Ensure Node.js and npm are installed.
3. Run `npm install` to install dependencies.
4. Modify `.env` file in the root directory with the necessary environment variables.
5. Start the bot using `node index.js`.

## Contributing

Contributions are welcome. Please follow the standard fork-and-pull request workflow for contributions.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
