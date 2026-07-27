import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

export default {
  customId: 'select_product',
  
  async execute(interaction, client) {
    const productId = interaction.values[0];
    const product = await client.db.products.findOne({ id: productId });
    
    if (!product) {
      return interaction.reply({ content: '❌ Sản phẩm này không còn tồn tại.', ephemeral: true });
    }

    // Tạo Modal cho người dùng nhập số lượng
    const modal = new ModalBuilder()
      .setCustomId(`buy_modal_${productId}`)
      .setTitle(`Mua ${product.name}`);

    const quantityInput = new TextInputBuilder()
      .setCustomId('quantity')
      .setLabel('Số lượng bạn muốn mua?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue('1');

    const noteInput = new TextInputBuilder()
      .setCustomId('note')
      .setLabel('Ghi chú (Tài khoản/Mật khẩu/Link nếu có)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(quantityInput);
    const secondActionRow = new ActionRowBuilder().addComponents(noteInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  }
};
