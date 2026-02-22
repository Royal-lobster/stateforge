import fs from 'fs';
import path from 'path';
import { DocsMarkdown } from '@/components/docs/DocsMarkdown';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function CanvasPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/docs/canvas.md'),
    'utf-8'
  );
  return (
    <>
      <DocsMarkdown content={content} />
      <DocsPrevNext />
    </>
  );
}
