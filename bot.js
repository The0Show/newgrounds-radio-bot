const { Client, Collection, MessageEmbed } = require("discord.js");
const Logger = require("./classes/Logger");
const fs = require("fs-extra");
require("dotenv").config();

const client = new Client({
    partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER", "USER"],
    intents: [
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_TYPING",
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_MESSAGES",
        "GUILD_VOICE_STATES",
    ],
});

const logger = new Logger(`Shard ${client.shard.ids[0]}`);

client.commands = new Collection();

const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const commandClass = require(`./commands/${file}`);
    const command = new commandClass();

    client.commands.set(command.data.name, commandClass);
}

client.on("ready", () => {
    logger.log(`Logged in as ${client.user.tag} and ready`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const commandClass = client.commands.get(interaction.commandName);

    if (!commandClass) return;

    const command = new commandClass();

    try {
        await command.execute(client, interaction, logger);
    } catch (error) {
        logger.error(
            `Caught ${error.name} during command ${interaction.commandName}`
        );
        logger.error(error);
        await interaction.reply({
            content: `There was a ${error.name} while executing this command.`,
            ephemeral: true,
        });
    }
});

client.on("messageCreate", (msg) => {
    if (msg.content.startsWith("ng!") || msg.content.startsWith("ngr!")) {
        msg.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("Hey there, I use slash commands now!")
                    .setDescription(
                        `The v2 rewrite now uses slash commands rather than text commands.\nIf your server added the bot before the v2 rewrite, you may need to ${
                            msg.member.permissions.has("MANAGE_GUILD")
                                ? ""
                                : "ask a server administrator to "
                        }[reinvite the bot](https://the0show.com/projects/discord-bots/newgrounds-radio-bot-h9xQFJH).`
                    ),
            ],
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
