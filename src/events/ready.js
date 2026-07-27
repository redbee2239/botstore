export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`[System] Logged in as ${client.user.tag}!`);
    console.log(`[System] Azurine Store Bot is online and ready.`);
    
    // Register slash commands to a specific guild for dev (or globally)
    const guildId = process.env.GUILD_ID;
    const commands = client.slashCommands.map(cmd => cmd.data.toJSON());
    
    if (guildId && guildId !== 'your_guild_id_here') {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        guild.commands.set(commands)
          .then(() => console.log(`[System] Slash commands registered to guild: ${guild.name}`))
          .catch(console.error);
      }
    } else {
      // Global registration
      client.application.commands.set(commands)
        .then(() => console.log(`[System] Slash commands registered globally.`))
        .catch(console.error);
    }
    
    client.user.setActivity('Azurine Store', { type: 3 }); // Watching
  },
};
