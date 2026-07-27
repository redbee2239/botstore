import { randomUUID } from 'node:crypto';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

const PANEL_ID = 'ticketPanel';
const DEFAULT_CONTENT = 'Vui lòng chọn loại ticket bạn cần hỗ trợ.';
const MAX_BUTTONS = 25;

async function getPanel(client) {
  return client.db.settings.findOne({ id: PANEL_ID });
}

async function savePanel(client, fields) {
  const panel = await getPanel(client);
  const updatedAt = Date.now();

  if (panel) return client.db.settings.update({ id: PANEL_ID }, { ...fields, updatedAt });

  return client.db.settings.create({
    id: PANEL_ID,
    content: DEFAULT_CONTENT,
    buttons: [],
    ...fields,
    createdAt: updatedAt,
    updatedAt,
  });
}

function createPanelMessage(panel) {
  const buttons = panel.buttons || [];
  const components = [];

  for (let index = 0; index < buttons.length; index += 5) {
    components.push(
      new ActionRowBuilder().addComponents(
        ...buttons.slice(index, index + 5).map(button =>
          new ButtonBuilder()
            .setCustomId(`ticket_panel_${button.id}`)
            .setLabel(button.label)
            .setStyle(ButtonStyle.Secondary)
        )
      )
    );
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle('🎫 Bảng Ticket')
        .setDescription(panel.content || DEFAULT_CONTENT)
        .setColor('#5865F2'),
    ],
    components,
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Quản lý bảng ticket')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand => subcommand
      .setName('nd')
      .setDescription('Đặt nội dung bảng ticket')
      .addStringOption(option => option
        .setName('noi_dung')
        .setDescription('Nội dung hiển thị trên bảng ticket')
        .setMaxLength(4000)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('btn')
      .setDescription('Thêm nút tạo ticket')
      .addStringOption(option => option
        .setName('noi_dung')
        .setDescription('Nội dung trên nút')
        .setMaxLength(80)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('xoa-btn')
      .setDescription('Xóa nút theo nội dung')
      .addStringOption(option => option
        .setName('noi_dung')
        .setDescription('Nội dung chính xác của nút cần xóa')
        .setMaxLength(80)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('gui')
      .setDescription('Gửi bảng ticket vào channel hiện tại')),

  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({ content: '❌ Lệnh này chỉ dùng trong server.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'nd') {
      const content = interaction.options.getString('noi_dung').trim();
      if (!content) {
        return interaction.reply({ content: '❌ Nội dung không được để trống.', ephemeral: true });
      }
      await savePanel(client, { content });
      return interaction.reply({ content: '✅ Đã cập nhật nội dung. Dùng `/ticket gui` để gửi bảng.', ephemeral: true });
    }

    if (subcommand === 'btn') {
      const label = interaction.options.getString('noi_dung').trim();
      if (!label) {
        return interaction.reply({ content: '❌ Nội dung nút không được để trống.', ephemeral: true });
      }
      const panel = await getPanel(client);
      const buttons = panel?.buttons || [];

      if (buttons.length >= MAX_BUTTONS) {
        return interaction.reply({ content: `❌ Bảng ticket chỉ hỗ trợ tối đa ${MAX_BUTTONS} nút.`, ephemeral: true });
      }

      if (buttons.some(button => button.label.toLowerCase() === label.toLowerCase())) {
        return interaction.reply({ content: '❌ Đã có nút có nội dung này.', ephemeral: true });
      }

      await savePanel(client, {
        buttons: [...buttons, { id: randomUUID().slice(0, 8), label }],
      });
      return interaction.reply({ content: `✅ Đã thêm nút **${label}**.`, ephemeral: true });
    }

    if (subcommand === 'xoa-btn') {
      const label = interaction.options.getString('noi_dung').trim();
      if (!label) {
        return interaction.reply({ content: '❌ Nội dung nút không được để trống.', ephemeral: true });
      }
      const panel = await getPanel(client);
      const buttons = panel?.buttons || [];
      const updatedButtons = buttons.filter(button => button.label.toLowerCase() !== label.toLowerCase());

      if (updatedButtons.length === buttons.length) {
        return interaction.reply({ content: '❌ Không tìm thấy nút có nội dung này.', ephemeral: true });
      }

      await savePanel(client, { buttons: updatedButtons });
      return interaction.reply({ content: `✅ Đã xóa nút **${label}**.`, ephemeral: true });
    }

    const panel = await getPanel(client);
    if (!panel?.buttons?.length) {
      return interaction.reply({ content: '❌ Hãy thêm ít nhất một nút bằng `/ticket btn` trước.', ephemeral: true });
    }

    await interaction.channel.send(createPanelMessage(panel));
    return interaction.reply({ content: '✅ Đã gửi bảng ticket.', ephemeral: true });
  },
};
