import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';

export default {
  customId: 'staff_claim_',

  async execute(interaction, client) {
    const orderId = interaction.customId.slice('staff_claim_'.length);
    const order = await client.db.orders.findOne({ orderId });
    const ticket = await client.db.tickets.findOne({ orderId });

    if (!order || !ticket || ticket.channelId !== interaction.channelId) {
      return interaction.reply({ content: '❌ Không tìm thấy ticket của đơn hàng này.', ephemeral: true });
    }

    const staffRoleIds = [
      config.roles.owner,
      config.roles.manager,
      config.roles.admin,
      config.roles.staff,
      config.roles.support,
      config.roles.helper,
    ];
    const memberRoles = interaction.guild.members.cache.get(interaction.user.id)?.roles.cache;
    const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
      interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) ||
      staffRoleIds.some(roleId => roleId && memberRoles?.has(roleId)) ||
      config.bot.ownerIds.includes(interaction.user.id) ||
      config.bot.developerIds.includes(interaction.user.id);

    if (!isStaff) {
      return interaction.reply({ content: '❌ Chỉ Staff mới có thể nhận đơn.', ephemeral: true });
    }

    if (order.status !== 'Waiting') {
      return interaction.reply({
        content: `❌ Đơn hàng này hiện đang ở trạng thái **${order.status}**.`,
        ephemeral: true,
      });
    }

    await client.db.orders.update(
      { orderId },
      {
        status: 'Processing',
        staff: interaction.user.id,
        staffName: interaction.user.username,
        claimedAt: Date.now(),
      }
    );
    await client.db.queue.update(
      { orderId },
      { status: 'Processing', staff: interaction.user.id }
    );
    await client.db.tickets.update(
      { orderId },
      { staff: interaction.user.id, status: 'Open' }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`staff_claim_${orderId}`)
        .setLabel('Đã nhận đơn')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`user_cancel_${orderId}`)
        .setLabel('Hủy Đơn')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${orderId}`)
        .setLabel('Đóng Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({
      content: `<@${order.userId}> Đơn hàng **${orderId}** đã được Staff <@${interaction.user.id}> nhận xử lý.`,
      components: [row],
    });
  },
};
