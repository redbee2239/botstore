import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } from 'discord.js';

export default {
  customId: 'home_buy',
  
  async execute(interaction, client) {
    const categories = await client.db.categories.all();
    
    if (!categories || categories.length === 0) {
      return interaction.reply({ content: '❌ Hiện tại Store chưa có danh mục sản phẩm nào. Vui lòng quay lại sau!', ephemeral: true });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_category')
      .setPlaceholder('Chọn danh mục sản phẩm bạn muốn mua...')
      .addOptions(
        categories.map(cat => 
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.name)
            .setValue(cat.id)
            .setEmoji(cat.emoji || '📦')
        )
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle('🛒 Chọn Danh Mục Sản Phẩm')
      .setDescription('Vui lòng chọn một danh mục bên dưới để xem các sản phẩm tương ứng.')
      .setColor('#2ecc71');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
