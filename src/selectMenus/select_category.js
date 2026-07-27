import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } from 'discord.js';

export default {
  customId: 'select_category',
  
  async execute(interaction, client) {
    const categoryId = interaction.values[0];
    const category = await client.db.categories.findOne({ id: categoryId });
    
    if (!category) {
      return interaction.reply({ content: '❌ Danh mục này không còn tồn tại.', ephemeral: true });
    }

    const products = await client.db.products.find({ categoryId: categoryId, visible: true });

    if (!products || products.length === 0) {
      return interaction.update({ 
        content: `Hiện tại danh mục **${category.emoji} ${category.name}** chưa có sản phẩm nào.`, 
        embeds: [], 
        components: [] 
      });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_product')
      .setPlaceholder('Chọn sản phẩm bạn muốn mua...')
      .addOptions(
        products.map(prod => 
          new StringSelectMenuOptionBuilder()
            .setLabel(prod.name)
            .setDescription(`Giá: ${prod.price.toLocaleString('vi-VN')}đ`)
            .setValue(prod.id)
            .setEmoji(prod.emoji || '🏷️')
        )
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle(`🛒 Danh mục: ${category.emoji} ${category.name}`)
      .setDescription('Vui lòng chọn sản phẩm bạn muốn mua ở menu bên dưới.')
      .setColor('#3498db');

    await interaction.update({ embeds: [embed], components: [row] });
  }
};
