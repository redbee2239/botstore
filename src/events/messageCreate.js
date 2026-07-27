export default {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName) || client.prefixCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // TODO: Thêm Permission & Cooldown check nếu cần

    try {
      await command.executePrefix(message, args, client);
    } catch (error) {
      console.error(`[Prefix Command Error] ${commandName}:`, error);
      message.reply('Đã xảy ra lỗi khi thực thi lệnh này!');
    }
  },
};
