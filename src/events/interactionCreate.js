export default {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[Command Error] ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Đã xảy ra lỗi khi thực thi lệnh này!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Đã xảy ra lỗi khi thực thi lệnh này!', ephemeral: true });
        }
      }
    } else if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId) || client.buttons.find(btn => interaction.customId.startsWith(btn.customId));
      if (!button) return;
      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error(`[Button Error] ${interaction.customId}:`, error);
      }
    } else if (interaction.isStringSelectMenu()) {
      const selectMenu = client.selectMenus.get(interaction.customId) || client.selectMenus.find(menu => interaction.customId.startsWith(menu.customId));
      if (!selectMenu) return;
      try {
        await selectMenu.execute(interaction, client);
      } catch (error) {
        console.error(`[SelectMenu Error] ${interaction.customId}:`, error);
      }
    } else if (interaction.isModalSubmit()) {
      let modal = client.modals.get(interaction.customId);
      
      // Khớp theo tiền tố (VD: buy_modal_yt1m)
      if (!modal) {
        const modalCommand = client.modals.find(mdl => interaction.customId.startsWith(mdl.customId));
        if (modalCommand) modal = modalCommand;
      }
      
      if (!modal) return;
      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.error(`[Modal Error] ${interaction.customId}:`, error);
      }
    } else if (interaction.isAutocomplete()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;
      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error(`[Autocomplete Error] ${interaction.commandName}:`, error);
      }
    }
  },
};
