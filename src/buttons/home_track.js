import { EmbedBuilder } from 'discord.js';

const statusLabels = {
  Waiting: 'Đang chờ',
  Pending: 'Chờ xác nhận',
  Processing: 'Đang xử lý',
  Paused: 'Tạm dừng',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Đã hủy',
  Refunded: 'Đã hoàn tiền',
  Failed: 'Thất bại',
};

export default {
  customId: 'home_track',

  async execute(interaction, client) {
    const orders = await client.db.orders.find({ userId: interaction.user.id });

    if (orders.length === 0) {
      return interaction.reply({ content: 'Bạn chưa có đơn hàng nào.', ephemeral: true });
    }

    const recentOrders = orders
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 10);

    const lines = await Promise.all(recentOrders.map(async order => {
      const [product, ticket] = await Promise.all([
        client.db.products.findOne({ id: order.productId }),
        client.db.tickets.findOne({ orderId: order.orderId }),
      ]);

      const createdAt = Number(order.createdAt);
      const createdLabel = Number.isFinite(createdAt)
        ? `<t:${Math.floor(createdAt / 1000)}:R>`
        : 'Không rõ thời gian';
      const queueLabel = ['Waiting', 'Processing'].includes(order.status) && order.queuePosition
        ? ` | Queue #${order.queuePosition}`
        : '';
      const ticketLabel = ticket ? ` | <#${ticket.channelId}>` : '';

      return [
        `**${order.orderId}** - ${product?.name || order.productId}`,
        `Trạng thái: **${statusLabels[order.status] || order.status}**${queueLabel}`,
        `Số lượng: ${order.quantity} | Tổng tiền: ${Number(order.price || 0).toLocaleString('vi-VN')}đ`,
        `${createdLabel}${ticketLabel}`,
      ].join('\n');
    }));

    const embed = new EmbedBuilder()
      .setTitle('📦 Theo dõi đơn hàng')
      .setDescription(lines.join('\n\n'))
      .setColor('#3498DB')
      .setFooter({
        text: orders.length > recentOrders.length
          ? `Hiển thị ${recentOrders.length}/${orders.length} đơn gần nhất`
          : `${orders.length} đơn hàng`,
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
