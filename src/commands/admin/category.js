import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('category')
    .setDescription('Quản lý danh mục sản phẩm (Admin Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('add').setDescription('Thêm danh mục mới')
      .addStringOption(opt => opt.setName('id').setDescription('ID danh mục (viết liền không dấu)').setRequired(true))
      .addStringOption(opt => opt.setName('name').setDescription('Tên danh mục').setRequired(true))
      .addStringOption(opt => opt.setName('emoji').setDescription('Emoji danh mục').setRequired(false)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Xóa danh mục')
      .addStringOption(opt => opt.setName('id').setDescription('ID danh mục').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Danh sách danh mục')),
  
  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    
    if (subCommand === 'add') {
      const id = interaction.options.getString('id');
      const name = interaction.options.getString('name');
      const emoji = interaction.options.getString('emoji') || '📦';
      
      const exists = await client.db.categories.exists({ id });
      if (exists) return interaction.reply({ content: `Danh mục với ID \`${id}\` đã tồn tại!`, ephemeral: true });

      await client.db.categories.create({ id, name, emoji, createdAt: Date.now() });
      return interaction.reply({ content: `✅ Đã thêm danh mục: **${emoji} ${name}** (\`${id}\`)`, ephemeral: true });
    }

    if (subCommand === 'remove') {
      const id = interaction.options.getString('id');
      const exists = await client.db.categories.exists({ id });
      if (!exists) return interaction.reply({ content: `Không tìm thấy danh mục \`${id}\`!`, ephemeral: true });

      await client.db.categories.delete({ id });
      return interaction.reply({ content: `✅ Đã xóa danh mục \`${id}\``, ephemeral: true });
    }

    if (subCommand === 'list') {
      const categories = await client.db.categories.all();
      if (categories.length === 0) return interaction.reply({ content: 'Hiện chưa có danh mục nào.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('📁 Danh sách Category')
        .setColor('#2ecc71')
        .setDescription(categories.map(c => `${c.emoji} **${c.name}** (\`${c.id}\`)`).join('\n'));
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
