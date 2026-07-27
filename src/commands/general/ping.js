import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra độ trễ của bot'),
  name: 'ping',
  aliases: ['p'],
  
  async execute(interaction, client) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Pong! 🏓\nĐộ trễ API: ${client.ws.ping}ms\nĐộ trễ Bot: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
  },

  async executePrefix(message, args, client) {
    const sent = await message.reply('Pinging...');
    sent.edit(`Pong! 🏓\nĐộ trễ API: ${client.ws.ping}ms\nĐộ trễ Bot: ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }
};
