# MM3DR Bot
This is a Discord bot developed for the Majora's Mask 3D Randomizer server.

To run this bot, first make your bot at the Discord [Developer portal](https://discord.com/developers/applications). Enable all intents besides OAuth2 grant, and invite your bot to your server.
Then copy `env.json.template` to `env.json`, and replace the values with the application ID and the Bot Token, and place it in the same folder as the rest of the bot code.

Run `npm i discord.js xml2js`, and then run `node launchCommands.js`, and finally you can run `node index.js` to run the bot.

If choosing to run through docker, simply call `docker compose up -d` once you have your `env.json` file, and the bot should automatically start.