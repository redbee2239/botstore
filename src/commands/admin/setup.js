import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Tạo panel mua hàng và hỗ trợ cho Azurine Store')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('🌟 Azurine Store - Dịch Vụ Chuyên Nghiệp')
      .setDescription('Chào mừng bạn đến với Azurine Store! Vui lòng chọn các dịch vụ bên dưới để tiếp tục.\n\nNhấn vào nút **🛒 Mua hàng** để bắt đầu quy trình mua sắm tự động.\nNhấn vào nút **🎫 Hỗ trợ** nếu bạn cần trợ giúp từ Staff.')
      .setColor('#00bfff') // Azurine blue
      .setImage('https://i.imgur.com/your-banner-here.png') // TODO: Thay URL ảnh banner của Store
      .setFooter({ text: 'Azurine Store Auto System', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('home_buy')
          .setLabel('Mua hàng')
          .setEmoji('🛒')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('home_ticket')
          .setLabel('Tạo Ticket Hỗ Trợ')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('home_track')
          .setLabel('Theo dõi đơn hàng')
          .setEmoji('📦')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Đã khởi tạo Home Panel thành công!', ephemeral: true });
  }
};
