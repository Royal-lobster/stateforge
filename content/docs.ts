import fs from 'fs';
import path from 'path';

function load(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'content', 'docs', `${name}.md`), 'utf-8');
}

export const docs = {
  index: load('index'),
  canvas: load('canvas'),
  transitions: load('transitions'),
  simulation: load('simulation'),
  modes: load('modes'),
  conversions: load('conversions'),
  grammar: load('grammar'),
  'l-systems': load('l-systems'),
  properties: load('properties'),
  'import-export': load('import-export'),
  shortcuts: load('shortcuts'),
};
