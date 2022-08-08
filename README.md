# Newgrounds Radio Bot

Listen to Newgrounds Radio via Discord.

Powered by Discord.JS, with classes to speed up the process.

Invite: https://the0show.com/projects/discord-bots/newgrounds-radio-bot-h9xQFJH

# Development

To setup for development, you'll need to create a `.env` file. This file should contain the following:

```
DISCORD_TOKEN=(the token for your bot)
DISCORD_DEV_TOKEN=(the token for your development bot)
DISCORD_CLIENT=(the client id for your discord application)
DISCORD_DEV_CLIENT=(the client id for your development discord application)
DISCORD_GUILD=(the id for the guild you'd like to test commands on)
```

Once you've done that, use `node index.js` to start the bot.

## Bot Setup

The `index.js` file shards the `bot.js` file for the best performance. The `bot.js` file handles commands.

## Classes

The `classes` folder contains classes that assist with the bot's functionality.

### `Command`

The `Command` class is the basis for all commands. Each seperate command extends this class.

### `Logger`

The `Logger` class adds prefixes to all console messages. This is to help with knowing which console messages came from what shard. In my opinion, this is a very bad implementation of this goal. Any improvements via Pull Requests are appreciated.

### `NewgroundsRadioStatus`

The `NewgroundsRadioStatus` class includes functions for interacting with [Newgrounds' Radio status API endpoint](https://stream01.ungrounded.net/status-json-custom.xsl). It takes in the domain via an argument, which is usually a value in `endpoints.json`.

## Any questions?

If you have any questions, feel free to [contact me](https://the0show.com/contact)!
