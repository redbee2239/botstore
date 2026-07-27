import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';

export default {
  customId: 'user_cancel_',

  async execute(interaction, client) {
    const orderId = interaction.customId.slice('user_cancel_'.length);
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
    const isOwner = order.userId === interaction.user.id;

    if (!isOwner && !isStaff) {
      return interaction.reply({ content: '❌ Bạn không có quyền hủy đơn hàng này.', ephemeral: true });
    }

    if (['Completed', 'Cancelled', 'Refunded', 'Failed'].includes(order.status)) {
      return interaction.reply({
        content: `❌ Đơn hàng này đã ở trạng thái **${order.status}**, không thể hủy.`,
        ephemeral: true,
      });
    }

    if (!isStaff && order.status !== 'Waiting') {
      return interaction.reply({
        content: '❌ Đơn hàng đã được Staff nhận xử lý nên bạn không thể tự hủy.',
        ephemeral: true,
      });
    }

    await client.db.orders.update(
      { orderId },
      {
        status: 'Cancelled',
        cancelledAt: Date.now(),
        cancelledBy: interaction.user.id,
      }
    );
    await client.db.queue.update(
      { orderId },
      { status: 'Cancelled' }
    );
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`staff_claim_${orderId}`)
        .setLabel('Nhận Đơn')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`user_cancel_${orderId}`)
        .setLabel('Đã hủy đơn')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${orderId}`)
        .setLabel('Đóng Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.update({
      content: `❌ Đơn hàng **${orderId}** đã bị hủy bởi <@${interaction.user.id}>.`,
      components: [row],
    });
  },
};
