const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const Logger = require("./Logger");

/**
 * The basis for a command.
 */
class Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor(commandData, testing) {
        this.data = commandData;
        this.testing = testing;
    }

    /**
     * Executes the command.
     * @param {Client} client The bot client.
     * @param {CommandInteraction} interaction The command interaction.
     * @param {Logger} logger The logger instance.
     */
    async execute(client, interaction, logger) {}
}

module.exports = Command;
