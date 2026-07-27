import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('product')
    .setDescription('Quản lý sản phẩm (Admin Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('add').setDescription('Thêm sản phẩm mới')
      .addStringOption(opt => opt.setName('id').setDescription('ID sản phẩm (vd: yt1m)').setRequired(true))
      .addStringOption(opt => opt.setName('category_id').setDescription('ID Danh mục').setRequired(true))
      .addStringOption(opt => opt.setName('name').setDescription('Tên sản phẩm').setRequired(true))
      .addNumberOption(opt => opt.setName('price').setDescription('Giá (VNĐ)').setRequired(true))
      .addStringOption(opt => opt.setName('emoji').setDescription('Emoji').setRequired(false)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Xóa sản phẩm')
      .addStringOption(opt => opt.setName('id').setDescription('ID sản phẩm').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Danh sách sản phẩm')),

  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    
    if (subCommand === 'add') {
      const id = interaction.options.getString('id');
      const categoryId = interaction.options.getString('category_id');
      const name = interaction.options.getString('name');
      const price = interaction.options.getNumber('price');
      const emoji = interaction.options.getString('emoji') || '🏷️';
      
      const catExists = await client.db.categories.exists({ id: categoryId });
      if (!catExists) return interaction.reply({ content: `Danh mục \`${categoryId}\` không tồn tại! Hãy tạo trước.`, ephemeral: true });

      const prodExists = await client.db.products.exists({ id });
      if (prodExists) return interaction.reply({ content: `Sản phẩm \`${id}\` đã tồn tại!`, ephemeral: true });

      await client.db.products.create({ id, categoryId, name, price, emoji, stock: -1, visible: true, createdAt: Date.now() });
      return interaction.reply({ content: `✅ Đã thêm sản phẩm: **${emoji} ${name}** (\`${id}\`) - Giá: ${price.toLocaleString('vi-VN')}đ`, ephemeral: true });
    }

    if (subCommand === 'remove') {
      const id = interaction.options.getString('id');
      const exists = await client.db.products.exists({ id });
      if (!exists) return interaction.reply({ content: `Không tìm thấy sản phẩm \`${id}\`!`, ephemeral: true });

      await client.db.products.delete({ id });
      return interaction.reply({ content: `✅ Đã xóa sản phẩm \`${id}\``, ephemeral: true });
    }

    if (subCommand === 'list') {
      const products = await client.db.products.all();
      if (products.length === 0) return interaction.reply({ content: 'Hiện chưa có sản phẩm nào.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('🛍️ Danh sách Sản phẩm')
        .setColor('#e67e22')
        .setDescription(products.map(p => `${p.emoji} **${p.name}** (\`${p.id}\`) - Cat: \`${p.categoryId}\` - Giá: ${p.price.toLocaleString('vi-VN')}đ`).join('\n'));
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
