import { createTicket } from './home_ticket.js';

const PANEL_ID = 'ticketPanel';

export default {
  customId: 'ticket_panel_',

  async execute(interaction, client) {
    const buttonId = interaction.customId.slice('ticket_panel_'.length);
    const panel = await client.db.settings.findOne({ id: PANEL_ID });
    const button = panel?.buttons?.find(item => item.id === buttonId);

    if (!button) {
      return interaction.reply({ content: '❌ Nút ticket này không còn tồn tại.', ephemeral: true });
    }

    return createTicket(interaction, client, {
      type: `panel:${button.id}`,
      title: button.label,
      panelButtonId: button.id,
    });
  },
};
