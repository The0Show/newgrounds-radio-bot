const { SlashCommandBuilder } = require("@discordjs/builders");
const { getVoiceConnection } = require("@discordjs/voice");
const { Client, CommandInteraction } = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");

class StopCommand extends Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("stop")
                .setDescription("Stops the radio and leaves the channel."),
            true
        );
    }

    /**
     * Executes the command.
     * @param {Client} client The bot client.
     * @param {CommandInteraction} interaction The command interaction.
     * @param {Logger} logger The logger instance.
     */
    async execute(client, interaction, logger) {
        const currentBotVoiceConnection =
            interaction.guild.voiceStates.cache.get("732092570804551711");

        const vc = getVoiceConnection(interaction.guild.id);

        if (
            !currentBotVoiceConnection ||
            currentBotVoiceConnection.channelId === null
        )
            return interaction.reply({
                content: "I'm not playing anything in this server.",
                ephemeral: true,
            });

        if (!interaction.member.voice.channel)
            return interaction.reply({
                content: `You need to be in the same voice channel as me (<#${currentBotVoiceConnection.channelId}>) to run this command.`,
                ephemeral: true,
            });

        if (
            currentBotVoiceConnection.channelId ===
            interaction.member.voice.channel.id
        ) {
            if (!vc) {
                currentBotVoiceConnection.disconnect();
            } else {
                vc.destroy();
            }

            interaction.reply({
                content:
                    "The session has been stopped and I have left the channel.",
            });
        } else {
            interaction.reply({
                content: `You need to be in the same voice channel as me (<#${currentBotVoiceConnection.channelId}>) to run this command.`,
                ephemeral: true,
            });
        }
    }
}

module.exports = StopCommand;
