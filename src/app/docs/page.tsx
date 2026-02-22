import fs from 'fs';
import path from 'path';
import { DocsMarkdown } from '@/components/docs/DocsMarkdown';
import { DocsPrevNext } from '@/components/docs/DocsPrevNext';

export default function DocsOverview() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/docs/index.md'),
    'utf-8'
  );
  return (
    <>
      <DocsMarkdown content={content} />
      <DocsPrevNext />
    </>
  );
}
