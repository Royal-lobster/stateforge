import fs from 'fs';
import path from 'path';
import { DocsMarkdown } from '@/components/docs/DocsMarkdown';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function DocsPage() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/docs/l-systems.md'),
    'utf-8'
  );
  return (
    <>
      <DocsMarkdown content={content} />
      <DocsPrevNext />
    </>
  );
}
