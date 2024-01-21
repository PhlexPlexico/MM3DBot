# MM3DR Bot
This is a Discord bot developed for the Majora's Mask 3D Randomizer server.

To run this bot, first make your bot at the Discord [Developer portal](https://discord.com/developers/applications). Enable all intents besides OAuth2 grant, and invite your bot to your server.
Then create env.json and place it in the same folder as the rest of the bot code:
```json
{
    "discordToken":theBotsToken,
    "clientId":theBotsUserId
}
```
Run `npm i discord.js xml2js`, and then run `node launchCommands.js`, and finally you can run `node index.js` to run the bot.