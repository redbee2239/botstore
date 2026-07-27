import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';

export async function createTicket(interaction, client, {
  type = 'support',
  title = 'Hỗ trợ',
  panelButtonId = null,
} = {}) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ Ticket chỉ có thể tạo trong server.', ephemeral: true });
    }

    const existingTicket = await client.db.tickets.findOne(ticket =>
      ticket.type === type &&
      ticket.userId === interaction.user.id &&
      ticket.status === 'Open'
    );

    if (existingTicket) {
      const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);
      if (existingChannel) {
        return interaction.reply({
          content: `Bạn đã có ticket **${title}** đang mở: <#${existingChannel.id}>`,
          ephemeral: true,
        });
      }

      await client.db.tickets.update(
        { channelId: existingTicket.channelId },
        { status: 'Closed', closedAt: Date.now() }
      );
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      let ticketCategory = config.categories.ticket
        ? interaction.guild.channels.cache.get(config.categories.ticket)
        : null;

      if (!ticketCategory || ticketCategory.type !== ChannelType.GuildCategory) {
        ticketCategory = interaction.guild.channels.cache.find(channel =>
          channel.type === ChannelType.GuildCategory && channel.name === '🎫・HỖ TRỢ'
        );
      }

      if (!ticketCategory) {
        ticketCategory = await interaction.guild.channels.create({
          name: '🎫・HỖ TRỢ',
          type: ChannelType.GuildCategory,
        });
      }

      const staffRoleIds = [
        config.roles.owner,
        config.roles.manager,
        config.roles.admin,
        config.roles.staff,
        config.roles.support,
        config.roles.helper,
      ];

      const permissionOverwrites = [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        ...[...new Set(staffRoleIds)]
          .filter(roleId => roleId && interaction.guild.roles.cache.has(roleId))
          .map(roleId => ({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          })),
      ];

    const ticketChannel = await interaction.guild.channels.create({
      name: type === 'support'
        ? `support-${interaction.user.id}`
        : `ticket-${panelButtonId || 'panel'}-${interaction.user.id}`,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        permissionOverwrites,
      });

      await client.db.tickets.create({
        channelId: ticketChannel.id,
        type,
        ...(panelButtonId ? { panelButtonId, buttonLabel: title } : {}),
        userId: interaction.user.id,
        status: 'Open',
        createdAt: Date.now(),
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket ${title}`)
        .setDescription('Vui lòng mô tả vấn đề của bạn. Staff sẽ phản hồi sớm nhất có thể.')
        .setColor('#5865F2')
        .setTimestamp();

      await ticketChannel.send({
        content: `<@${interaction.user.id}> Ticket **${title}** đã được tạo.`,
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`ticket_close_${type}`)
              .setLabel('Đóng Ticket')
              .setEmoji('🔒')
              .setStyle(ButtonStyle.Secondary)
          ),
        ],
      });

      await interaction.editReply({ content: `✅ Đã tạo ticket **${title}**: <#${ticketChannel.id}>` });
    } catch (error) {
      console.error('[Ticket Error]:', error);
      await interaction.editReply({ content: '❌ Không thể tạo ticket lúc này.' });
    }
}

export default {
  customId: 'home_ticket',

  execute(interaction, client) {
    return createTicket(interaction, client);
  },
};
