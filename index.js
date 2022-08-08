// Imports
const { ShardingManager } = require("discord.js");
const fs = require("fs-extra");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();

const isProd = process.argv.includes("--prod");

// Read command data and push the data to these arrays depending on the testing value
const publicCommands = [];
const privateCommands = [];
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const commandClass = require(`./commands/${file}`);
	const command = new commandClass();

	if (command.testing) {
		privateCommands.push(command.data.toJSON());
	} else {
		publicCommands.push(command.data.toJSON());
	}
}

// Initialize the REST API and make PUT requests to register commands.
const rest = new REST({ version: "9" }).setToken(
	isProd ? process.env.DISCORD_TOKEN : process.env.DISCORD_DEV_TOKEN
);

(async () => {
	await rest
		.put(
			Routes.applicationCommands(
				isProd
					? process.env.DISCORD_CLIENT
					: process.env.DISCORD_DEV_CLIENT
			),
			{
				body: publicCommands,
			}
		)
		.then(() =>
			console.log(
				`Successfully registered ${publicCommands.length} public application commands.`
			)
		)
		.catch(console.error);

	await rest
		.put(
			Routes.applicationGuildCommands(
				isProd
					? process.env.DISCORD_CLIENT
					: process.env.DISCORD_DEV_CLIENT,
				process.env.DISCORD_GUILD
			),
			{ body: privateCommands }
		)
		.then(() =>
			console.log(
				`Successfully registered ${privateCommands.length} private application commands.`
			)
		)
		.catch(console.error);

	// Sharding
	const manager = new ShardingManager("./bot.js", {
		token: isProd
			? process.env.DISCORD_TOKEN
			: process.env.DISCORD_DEV_TOKEN,
		respawn: true,
		shardArgs: [process.argv[2]],
	});

	manager.on("shardCreate", (shard) =>
		console.log(`[Sharding] Launched shard ${shard.id}`)
	);

	manager.spawn();

	process.on("SIGINT", (code) => {
		manager.shards.forEach((shard) => {
			shard.kill();
			console.log(`[Sharding] Killed shard ${shard.id}`);
		});
	});
})();
