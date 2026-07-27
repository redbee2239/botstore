import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';

export default {
  customId: 'buy_modal_', // Prefix matching
  
  async execute(interaction, client) {
    // Tách lấy productId từ customId (vd: buy_modal_yt1m)
    const productId = interaction.customId.split('buy_modal_')[1];
    
    // Lấy dữ liệu từ modal
    const quantityStr = interaction.fields.getTextInputValue('quantity');
    const note = interaction.fields.getTextInputValue('note') || 'Không có';
    
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) {
      return interaction.reply({ content: '❌ Số lượng không hợp lệ! Vui lòng nhập số lớn hơn 0.', ephemeral: true });
    }

    const product = await client.db.products.findOne({ id: productId });
    if (!product) {
      return interaction.reply({ content: '❌ Sản phẩm không tồn tại.', ephemeral: true });
    }

    // 1. Sinh Order ID (OD000001, ...)
    const orderId = await client.db.orders.generateId('OD', 6);
    const totalPrice = product.price * quantity;

    // 2. Tính vị trí Queue
    // Đếm số đơn đang ở trạng thái 'Waiting' hoặc 'Processing'
    const currentQueue = await client.db.orders.count(order => order.status === 'Waiting' || order.status === 'Processing');
    const queuePosition = currentQueue + 1;

    // 3. Tạo record Order
    const newOrder = {
      orderId,
      userId: interaction.user.id,
      username: interaction.user.username,
      productId: product.id,
      categoryId: product.categoryId,
      quantity,
      price: totalPrice,
      note,
      status: 'Waiting', // Waiting, Processing, Paused, Completed, Cancelled
      staff: null,
      createdAt: Date.now(),
      queuePosition
    };
    
    await client.db.orders.create(newOrder);

    // 4. Cập nhật vào global Queue (Chỉ lưu Order ID để track dễ hơn)
    await client.db.queue.create({ orderId, status: 'Waiting' });

    // 5. Tạo Ticket Channel cho Order này
    const categoryName = '📦・ĐƠN HÀNG'; // Có thể config Category ID riêng trong settings.json
    let ticketCategory = interaction.guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
    
    if (!ticketCategory) {
      // Nếu chưa có category thì tạo
      ticketCategory = await interaction.guild.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
      });
    }

    const channelName = `ticket-${orderId.toLowerCase()}`;
    const staffRoleIds = [
      config.roles.owner,
      config.roles.manager,
      config.roles.admin,
      config.roles.staff,
      config.roles.support,
      config.roles.helper,
    ];
    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: ticketCategory.id,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel], // Ẩn với everyone
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory], // Hiện với khách
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
      ],
    });

    // Lưu thông tin Ticket vào DB
    await client.db.tickets.create({
      channelId: ticketChannel.id,
      orderId,
      userId: interaction.user.id,
      status: 'Open',
      createdAt: Date.now()
    });

    // 6. Gửi tin nhắn xác nhận cho khách hàng
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Đơn hàng của bạn đã được xác nhận')
      .setDescription(`**Mã đơn:** ${orderId}\n📦 **Sản phẩm:** ${product.emoji} x${quantity} ${product.name}\n💵 **Thành tiền:** ${totalPrice.toLocaleString('vi-VN')}đ\n\nVui lòng chờ từ 24h đến 48h để đơn hàng được hoàn thành.\n\n👉 Theo dõi trạng thái đơn hàng tại <#${ticketChannel.id}>`)
      .setColor('#2ecc71')
      .setFooter({ text: `Đơn hàng ${orderId} đã đưa vào xử lý` })
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });

    // 7. Gửi thông tin vào Ticket Channel
    const ticketEmbed = new EmbedBuilder()
      .setTitle(`🛒 Đơn Hàng Mới: ${orderId}`)
      .setColor('#00bfff')
      .addFields(
        { name: 'Khách hàng', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Sản phẩm', value: `${product.emoji} ${product.name}`, inline: true },
        { name: 'Số lượng', value: `${quantity}`, inline: true },
        { name: 'Tổng tiền', value: `${totalPrice.toLocaleString('vi-VN')}đ`, inline: true },
        { name: 'Ghi chú', value: `\`\`\`${note}\`\`\``, inline: false },
        { name: '📌 Vị trí Queue', value: `Đơn hàng của bạn đang ở vị trí **${queuePosition}**.\n\n*Lưu ý: Bạn có thể tip cho nhân viên phụ trách để đơn được duyệt nhanh hơn.*`, inline: false }
      )
      .setTimestamp();

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`staff_claim_${orderId}`)
        .setLabel('Nhận Đơn')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`user_cancel_${orderId}`)
        .setLabel('Hủy Đơn')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`ticket_close_${orderId}`)
        .setLabel('Đóng Ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({
      content: `<@${interaction.user.id}> Đơn hàng của bạn đã được tạo! Vui lòng chờ Staff hỗ trợ.`,
      embeds: [ticketEmbed],
      components: [actionRow]
    });
  }
};
