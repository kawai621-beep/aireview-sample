import { createWriteStream, type WriteStream } from 'fs';
import { prisma } from '../db/prisma';

/**
 * 投稿一覧を CSV にエクスポートする。
 */
export async function exportPostsCsv(): Promise<string> {
  const posts = await prisma.post.findMany();
  const path = '/tmp/posts-export.csv';
  const stream: WriteStream = createWriteStream(path);
  stream.write('id,title,content\n');
  for (const p of posts) {
    stream.write(`${p.id},${p.title},${p.content}\n`);
  }
  return path;
}
