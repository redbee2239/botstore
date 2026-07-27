import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';
import { saveTranscript } from '../utils/transcript.js';

export default {
  customId: 'ticket_close_',

  async execute(interaction, client) {
    const ticket = await client.db.tickets.findOne({ channelId: interaction.channelId });

    if (!ticket) {
      return interaction.reply({ content: '❌ Không tìm thấy ticket này trong hệ thống.', ephemeral: true });
    }

    if (ticket.status === 'Closed') {
      return interaction.reply({ content: '❌ Ticket này đã được đóng.', ephemeral: true });
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

    if (ticket.userId !== interaction.user.id && !isStaff) {
      return interaction.reply({ content: '❌ Bạn không có quyền đóng ticket này.', ephemeral: true });
    }

    await interaction.deferUpdate();

    try {
      const transcript = await saveTranscript(interaction.channel, {
        orderId: ticket.orderId,
        type: ticket.type || 'order',
        closedBy: interaction.user.tag || interaction.user.username,
      });

      await client.db.tickets.update(
        { channelId: interaction.channelId },
        {
          status: 'Closed',
          closedAt: Date.now(),
          closedBy: interaction.user.id,
          transcriptPath: transcript.relativePath,
        }
      );

      if (interaction.channel?.permissionOverwrites) {
        await interaction.channel.permissionOverwrites.edit(ticket.userId, {
          SendMessages: false,
        });
      }

      const logChannelId = config.channels.ticketLog || config.channels.log;
      let transcriptLogChannelId = null;

      if (logChannelId) {
        try {
          const logChannel = await interaction.guild.channels.fetch(logChannelId);
          if (!logChannel?.isTextBased()) throw new Error(`Channel ${logChannelId} is not text-based`);

          await logChannel.send({
            content: `🔒 Ticket **${interaction.channel.name}** đã đóng bởi <@${interaction.user.id}>.`,
            files: [new AttachmentBuilder(transcript.filePath, { name: transcript.filename })],
          });
          transcriptLogChannelId = logChannel.id;
        } catch (error) {
          console.error('[Transcript Log Error]:', error);
        }
      }

      const closedContent = [
        interaction.message.content || '',
        `\n🔒 Ticket đã đóng bởi <@${interaction.user.id}>. Transcript: \`${transcript.relativePath}\`.`,
        transcriptLogChannelId ? ` Đã gửi file vào <#${transcriptLogChannelId}>.` : '',
      ].join('');

      await interaction.message.edit({
        content: closedContent,
        components: [],
      });
    } catch (error) {
      console.error('[Ticket Close Error]:', error);
      await interaction.followUp({ content: '❌ Không thể tạo transcript hoặc đóng ticket.', ephemeral: true });
    }
  },
};
