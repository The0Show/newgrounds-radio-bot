const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioResource,
    createAudioPlayer,
    entersState,
} = require("@discordjs/voice");
const {
    Client,
    CommandInteraction,
    MessageActionRow,
    MessageButton,
    VoiceChannel,
    MessageEmbed,
} = require("discord.js");
const Command = require("../classes/Command");
const Logger = require("../classes/Logger");
const NewgroundsRadioStatus = require("../classes/NewgroundsRadioStatus");
const endpoints = require("../endpoints.json");
const wait = require("util").promisify(setTimeout);

class PlayCommand extends Command {
    /**
     * The basis for a command.
     * @param {SlashCommandBuilder} data The command data.
     * @param {boolean} testing If the command should be public or not.
     */
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("play")
                .setDescription("Listen to Newgrounds Radio!")
                .addStringOption((option) => {
                    return option
                        .setName("station")
                        .setDescription(
                            "Which station do you want to listen to?"
                        )
                        .setRequired(true)
                        .addChoices([
                            ["Easy Listening", "/easylistening"],
                            ["Electronic", "/electronic"],
                            ["Heavy Metal", "/heavymetal"],
                            ["Hip-Hop", "/hiphop"],
                            ["Newgrounds Mix", "/ngmix"],
                            ["Podcasts", "/podcasts"],
                            ["Rock", "/rock"],
                        ]);
                }),
            false
        );
    }

    /**
     * Joins the voice channel and plays the mount.
     * @param {Client} client The bot client.
     * @param {CommandInteraction} interaction The command interaction.
     * @param {VoiceChannel} channel The voice channel to join.
     * @param {string} mount The NGR mount to play. This is usually provided by {@link CommandInteraction.options}.
     */
    async playMount(client, interaction, channel, mount) {
        // get data from server
        const { server_name, server_description, current_song } =
            await new NewgroundsRadioStatus(endpoints.status).getMountStatus(
                mount
            );

        const embed = new MessageEmbed()
            .setTitle(server_name)
            .setDescription(server_description)
            .addField("Now Playing", current_song)
            .setColor("#eeb211");

        const invalidPerms = new MessageEmbed()
            .setTitle("Cannot join channel")
            .setDescription(
                `I don't have permission to \`Connect\`, \`Use Voice Activity\`, and/or \`Speak\` in your channel (<#${
                    channel.id
                }>). ${
                    channel
                        .permissionsFor(interaction.member)
                        .has("MANAGE_CHANNELS")
                        ? "Try"
                        : "ask a server administrator to try "
                } modifying my permissions for <#${
                    channel.id
                }>, or try a different channel.`
            )
            .setColor("#eeb211");

        // if i don't have permissions i need in the channel
        if (
            !channel.permissionsFor(client.user).has("CONNECT") ||
            !channel.permissionsFor(client.user).has("USE_VAD") ||
            !channel.permissionsFor(client.user).has("SPEAK")
        ) {
            if (interaction.replied) {
                interaction.editReply({
                    content: " ",
                    components: [],
                    embeds: [invalidPerms],
                });
            } else {
                interaction.reply({
                    content: " ",
                    components: [],
                    embeds: [invalidPerms],
                });
            }

            return;
        }

        // join the channel, create the audio resource and player
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(`${endpoints.audio}${mount}`, {});

        const audioPlayer = createAudioPlayer();

        connection.subscribe(audioPlayer);

        audioPlayer.play(resource);

        if (interaction.replied) {
            interaction.editReply({
                content: " ",
                components: [],
                embeds: [embed],
            });
        } else {
            interaction.reply({
                content: " ",
                components: [],
                embeds: [embed],
            });
        }
    }

    /**
     * Executes the command.
     * @param {Client} client The bot client.
     * @param {CommandInteraction} interaction The command interaction.
     * @param {Logger} logger The logger instance.
     */
    async execute(client, interaction, logger) {
        const mount = interaction.options.getString("station");

        if (!interaction.member.voice.channel)
            return interaction.reply({
                content:
                    "You need to be in a voice channel to use this command.",
                ephemeral: true,
            });

        const currentBotVoiceConnection =
            interaction.guild.voiceStates.cache.get(client.user.id);

        if (
            !currentBotVoiceConnection ||
            currentBotVoiceConnection.channelId === null
        ) {
            // bot is not in any channel in server
            this.playMount(
                client,
                interaction,
                interaction.member.voice.channel,
                mount
            );
        } else if (
            currentBotVoiceConnection.channelId !==
            interaction.member.voice.channel.id
        ) {
            // bot is already in a channel, and user is in different channel
            let msg = {
                content: `I'm already in <#${
                    currentBotVoiceConnection.channelId
                }>!\n${
                    interaction.member.permissions.has("MOVE_MEMBERS")
                        ? "Because you have the `MOVE_MEMBERS` permission, you can move me to your channel. Would you like to do that?"
                        : "You cannot move me because you do not have the `MOVE_MEMBERS` permission."
                }`,
                fetchReply: true,
            };

            let confirmMoveComponent = new MessageActionRow();

            // if the user can move members, give them the option to move the bot to their channel
            if (interaction.member.permissions.has("MOVE_MEMBERS")) {
                confirmMoveComponent.addComponents(
                    new MessageButton()
                        .setLabel("Yes")
                        .setStyle("SECONDARY")
                        .setCustomId(`${interaction.id}-moveConfirmationYes`),
                    new MessageButton()
                        .setLabel("No")
                        .setStyle("SECONDARY")
                        .setCustomId(`${interaction.id}-moveConfirmationNo`)
                );

                msg.components = [confirmMoveComponent];
            }

            const m = await interaction.reply(msg);

            if (interaction.member.permissions.has("MOVE_MEMBERS")) {
                const filter = (i) => {
                    i.deferUpdate();
                    return i.user.id === interaction.user.id;
                };

                m.awaitMessageComponent({
                    filter,
                    componentType: "BUTTON",
                    time: 5000,
                })
                    .then((i) => {
                        if (
                            i.customId ===
                            `${interaction.id}-moveConfirmationYes`
                        ) {
                            this.playMount(
                                client,
                                interaction,
                                interaction.member.voice.channel,
                                mount
                            );
                        }

                        interaction.editReply({
                            components: [
                                new MessageActionRow().addComponents(
                                    new MessageButton()
                                        .setLabel("Yes")
                                        .setStyle("SECONDARY")
                                        .setCustomId(
                                            `${interaction.id}-moveConfirmationYesDisabled`
                                        )
                                        .setDisabled(true),
                                    new MessageButton()
                                        .setLabel("No")
                                        .setStyle("SECONDARY")
                                        .setCustomId(
                                            `${interaction.id}-moveConfirmationNoDisabled`
                                        )
                                        .setDisabled(true)
                                ),
                            ],
                        });
                    })
                    .catch((err) => {
                        interaction.editReply({
                            components: [
                                new MessageActionRow().addComponents(
                                    new MessageButton()
                                        .setLabel("Yes")
                                        .setStyle("SECONDARY")
                                        .setCustomId(
                                            `${interaction.id}-moveConfirmationYesDisabled`
                                        )
                                        .setDisabled(true),
                                    new MessageButton()
                                        .setLabel("No")
                                        .setStyle("SECONDARY")
                                        .setCustomId(
                                            `${interaction.id}-moveConfirmationNoDisabled`
                                        )
                                        .setDisabled(true)
                                ),
                            ],
                        });
                    });
            }
        } else if (
            currentBotVoiceConnection.channelId ===
            interaction.member.voice.channel.id
        ) {
            // bot and user are in the same channel
            const connection = getVoiceConnection(interaction.guild.id);

            // bot is not playing anything
            if (!connection)
                return this.playMount(
                    client,
                    interaction,
                    interaction.member.voice.channel,
                    mount
                );

            // only 1 other person in channel
            if (currentBotVoiceConnection.channel.members.size === 2)
                return this.playMount(
                    client,
                    interaction,
                    interaction.member.voice.channel,
                    mount
                );

            // if both tests failed then we need to vote

            // get data from endpoint
            const mountData = await new NewgroundsRadioStatus(
                endpoints.status
            ).getMountStatus(mount);

            // format the mount name
            let formattedMountName = mountData.server_name.replace(
                " Radio",
                ""
            );

            if (formattedMountName !== "Newgrounds Mix")
                formattedMountName = formattedMountName.replace(
                    "Newgrounds ",
                    ""
                );

            let approvedCount = [];
            let neededCount = Math.round(
                (currentBotVoiceConnection.channel.members.size - 1) / 2
            );

            let embed = new MessageEmbed()
                .setTitle(
                    `${
                        interaction.member.nickname
                            ? interaction.member.nickname
                            : interaction.member.user.username
                    } wants to switch stations`
                )
                .setDescription(
                    `${
                        interaction.member.nickname
                            ? interaction.member.nickname
                            : interaction.member.user.username
                    } would like to switch to the ${formattedMountName} station.\nPress the button below to accept this switch.`
                )
                .setColor("#eeb211");

            let button = new MessageButton()
                .setLabel(
                    `Yes, switch stations (${approvedCount.length}/${neededCount})`
                )
                .setStyle("SUCCESS")
                .setCustomId(`${interaction.id}-approveStationSwitch`)
                .setEmoji("✅")
                .setDisabled(false);
            let actionRow = new MessageActionRow().setComponents(button);

            const m = await interaction.reply({
                embeds: [embed],
                components: [actionRow],
                fetchReply: true,
            });

            // create a collector for voting
            const collector = m.createMessageComponentCollector({
                componentType: "BUTTON",
                time: 20000,
            });

            collector.on("collect", async (i) => {
                // if the user hasn't voted yet, add them to the vote count
                if (i.user.id === interaction.user.id)
                    return i.reply({
                        content: "You can't approve your own request!",
                        ephemeral: true,
                    });

                if (approvedCount.includes(i.user.id))
                    return i.reply({
                        content: "You've already approved this request.",
                        ephemeral: true,
                    });

                i.deferUpdate();

                approvedCount.push(i.user.id);

                button = new MessageButton()
                    .setLabel(
                        `Yes, switch stations (${approvedCount.length}/${neededCount})`
                    )
                    .setStyle("SUCCESS")
                    .setCustomId(`${interaction.id}-approveStationSwitch`)
                    .setEmoji("✅")
                    .setDisabled(false);
                actionRow = new MessageActionRow().setComponents(button);

                // if the vote passed play the mount
                if (approvedCount.length >= neededCount) {
                    button.setDisabled(true);

                    this.playMount(
                        client,
                        interaction,
                        interaction.member.voice.channel,
                        mount
                    );

                    collector.stop();
                } else {
                    interaction.editReply({ components: [actionRow] });
                }
            });

            collector.on("end", (collected) => {
                // if there isn't enough votes, change the message
                if (approvedCount.length < neededCount) {
                    button.setDisabled(true);

                    embed.setDescription(
                        `${
                            interaction.member.nickname
                                ? interaction.member.nickname
                                : interaction.member.user.username
                        }'s request to switch to the ${formattedMountName} station did not get enough votes.`
                    );

                    interaction.editReply({
                        components: [actionRow],
                        embeds: [embed],
                    });
                }
            });
        } else {
            // something went wrong
            console.assert();
        }
    }
}

module.exports = PlayCommand;
