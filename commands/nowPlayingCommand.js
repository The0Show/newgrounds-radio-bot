const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    Client,
    CommandInteraction,
    MessageSelectMenu,
    MessageActionRow,
    MessageEmbed,
} = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");
const NewgroundsRadioStatus = require("../classes/NewgroundsRadioStatus");
const endpoints = require("../endpoints.json");

class NowPlayingCommand extends Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("nowplaying")
                .setDescription("Get the currently playing song."),
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
        let dropdown = new MessageSelectMenu()
            .addOptions([
                {
                    label: "Easy Listening",
                    description:
                        "A mix of easy listening genres made by Newgrounds users!",
                    value: "/easylistening",
                },
                {
                    label: "Electronic",
                    description:
                        "A mix of electronic genres made by Newgrounds users!",
                    value: "/electronic",
                },
                {
                    label: "Heavy Metal",
                    description:
                        "A mix of heavy metal, industrial, and goth made by Newgrounds users!",
                    value: "/heavymetal",
                },
                {
                    label: "Hip-Hop",
                    description:
                        "A mix of hip hop, rap, and R&B made by Newgrounds users!",
                    value: "/hiphop",
                },
                {
                    label: "Newgrounds Mix",
                    description:
                        "An eclectic mix of genres made by Newgrounds users!",
                    value: "/ngmix",
                },
                {
                    label: "Podcasts",
                    description:
                        "A mix of discussion, music, and other storytelling podcasts made by Newgrounds users!",
                    value: "/podcasts",
                },
                {
                    label: "Rock",
                    description:
                        "A mix of rock and pop music made by Newgrounds users!",
                    value: "/rock",
                },
            ])
            .setCustomId(`${interaction.id}-npMountSelection`)
            .setMaxValues(1)
            .setPlaceholder("Select a station...");

        let row = new MessageActionRow().setComponents(dropdown);

        const m = await interaction.reply({
            content: "Select a station to see what it's playing!",
            components: [row],
            fetchReply: true,
        });

        const collector = m.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            time: 30000,
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id)
                return i.reply({
                    content: "This isn't your interaction!",
                    ephemeral: true,
                });

            const { server_name, server_description, current_song } =
                await new NewgroundsRadioStatus(
                    endpoints.status
                ).getMountStatus(i.values[0]);

            const embed = new MessageEmbed()
                .setTitle(server_name)
                .setDescription(server_description)
                .addField("Now Playing", current_song)
                .setColor("#eeb211");

            interaction.editReply({
                content: " ",
                embeds: [embed],
            });

            i.deferUpdate();
        });

        collector.on("end", () => {
            dropdown.setDisabled(true);

            row.setComponents(dropdown);

            interaction.editReply({
                components: [row],
            });
        });
    }
}

module.exports = NowPlayingCommand;
