const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction } = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");

class PingCommand extends Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("ping")
                .setDescription("Test the latency of the bot."),
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
            content: "Ping...",
            fetchReply: true,
        });

        let botping = msg.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply({
            content: `Pong! Bot took ${botping}ms to reply.`,
        });
    }
}

module.exports = PingCommand;
