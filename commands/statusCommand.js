const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");
const { version } = require("../package.json");

class PingCommand extends Command {
	/**
	 * The basis for a command.
	 * @param {SlashCommandBuilder} data The command data.
	 * @param {boolean} testing If the command should be public or not.
	 */
	constructor() {
		super(
			new SlashCommandBuilder()
				.setName("status")
				.setDescription("That isn't smoke, it's *steam*"),
			false
		);
	}

	/**
	 * Executes the command.
	 * @param {Client} client The bot client.
	 * @param {CommandInteraction} interaction The command interaction.
	 * @param {Logger} logger The logger instance.
	 */
	async execute(client, interaction, logger) {
		const msg = await interaction.reply({
			content: "Please wait...",
			fetchReply: true,
		});

		let botping = msg.createdTimestamp - interaction.createdTimestamp;

		const guildCount = await client.shard
			.fetchClientValues("guilds.cache.size")
			.then((results) => {
				return results.reduce((acc, guildCount) => acc + guildCount, 0);
			})
			.catch(console.error);

		interaction.editReply({
			content: ` `,
			embeds: [
				new MessageEmbed()
					.setTitle(`${client.user.username} v${version}`)
					.addField(
						"Ping",
						`${botping >= 1000 ? "**" : ""}${botping}ms${
							botping >= 1000 ? "**" : ""
						}`
					)
					.addField(
						"Server Count",
						`${guildCount} server${guildCount !== 1 ? "s" : ""}`
					)
					.addField(
						"Uptime",
						`${Math.floor(process.uptime())} second${
							Math.floor(process.uptime()) !== 1 ? "s" : ""
						}`
					)
					.addField("IP Address", "||nope||"),
			],
		});
	}
}

module.exports = PingCommand;
