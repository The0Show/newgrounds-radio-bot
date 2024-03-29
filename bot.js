// Imports
const { Client, Collection, MessageEmbed } = require("discord.js");
const Logger = require("./classes/Logger");
const fs = require("fs-extra");
require("dotenv").config();

const isProd = process.argv.includes("--prod");

// The bot's client.
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

// Initizlizes the logger.
const logger = new Logger(`Shard ${client.shard.ids[0]}`);

// Create a commands collection, read all .js files in the /commands folder, and register them
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

// when an interaction is created
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

// if someone tries to use the old prefix, tell them about v2
client.on("messageCreate", (msg) => {
	if (msg.content.startsWith("ng!") || msg.content.startsWith("ngr!")) {
		msg.reply({
			embeds: [
				new MessageEmbed()
					.setTitle("Hey there, I use slash commands now!")
					.setDescription(
						`The v2 rewrite now uses slash commands rather than text commands.\nIf my slash commands don't appear, you may need to ${
							msg.member.permissions.has("MANAGE_GUILD")
								? ""
								: "ask a server administrator to "
						}[reinvite the bot](https://the0show.com/projects/discord-bots/newgrounds-radio-bot-h9xQFJH).`
					),
			],
		});
	}
});

client.login(
	isProd ? process.env.DISCORD_TOKEN : process.env.DISCORD_DEV_TOKEN
);
