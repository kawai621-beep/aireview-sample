import { marked } from 'marked';

export function MarkdownRenderer({ content }: { content: string }) {
  const html = marked.parse(content) as string;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
