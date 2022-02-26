const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");
const { version } = require("../package.json");

class AboutCommand extends Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("about")
                .setDescription(
                    "See information on the bot and it's creators."
                ),
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
        const embed = new MessageEmbed()
            .setTitle(`${client.user.username} v${version}`)
            .setDescription(
                `Originally created by [The0Show](https://the0show.com) <t:1593750870:R>, ${client.user.username} streams [Newgrounds Radio](https://radio.newgrounds.com) to any voice channel in your server.
                \n<t:1645411200:R>, he rewrote the bot for a v2 rerelease, which added new functionality and QoL features.`
            )
            .addField(
                "Special Thanks",
                "Newgrounds Staff\n[GitHub Contributors](https://github.com/The0Show/newgrounds-radio-bot/contributors)\nAnyone else I forgot"
            )
            .setColor("#eeb211");

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

module.exports = AboutCommand;
