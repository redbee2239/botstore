import fs from 'fs/promises';
import path from 'path';

export async function saveTranscript(channel, metadata = {}) {
  const messages = [];
  let before;

  do {
    const options = { limit: 100 };
    if (before) options.before = before;

    const batch = await channel.messages.fetch(options);
    messages.push(...batch.values());

    if (batch.size < 100) break;
    before = batch.last().id;
  } while (before);

  messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const transcriptDir = path.join(process.cwd(), 'transcripts');
  await fs.mkdir(transcriptDir, { recursive: true });

  const safeChannelName = channel.name.replace(/[^a-z0-9_-]/gi, '_');
  const filename = `${safeChannelName}-${Date.now()}.txt`;
  const filePath = path.join(transcriptDir, filename);
  const lines = [
    `Ticket: ${metadata.orderId || metadata.type || channel.name}`,
    `Channel: #${channel.name} (${channel.id})`,
    `Closed by: ${metadata.closedBy || 'Unknown'}`,
    `Closed at: ${new Date().toISOString()}`,
    `Messages: ${messages.length}`,
    '',
  ];

  for (const message of messages) {
    const author = message.author?.tag || message.author?.username || 'Unknown';
    const content = message.content || '[Không có nội dung văn bản]';
    const attachments = [...message.attachments.values()].map(attachment => attachment.url);
    const attachmentText = attachments.length ? `\nAttachments: ${attachments.join(', ')}` : '';

    lines.push(`[${new Date(message.createdTimestamp).toISOString()}] ${author} (${message.author?.id || 'unknown'}):`);
    lines.push(content);
    if (attachmentText) lines.push(attachmentText);
    lines.push('');
  }

  await fs.writeFile(filePath, lines.join('\n'), 'utf8');

  return {
    filePath,
    relativePath: path.join('transcripts', filename),
    filename,
    messageCount: messages.length,
  };
}
