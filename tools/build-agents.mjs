#!/usr/bin/env node
// Builds the Claude Code and Codex versions of each Markdown-only agent from its
// single source file. Never edit the files in dist/; edit the source and rebuild.
//
//   node tools/build-agents.mjs            rebuild dist/
//   node tools/build-agents.mjs --install  rebuild dist/, then install into ~/.claude/agents and ~/.codex/agents
//   node tools/build-agents.mjs --check    fail if dist/ or an installed copy is out of date

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const agents = [
  {
    name: 'chisel',
    source: 'chisel.md',
    description:
      'Chisel, a senior frontend engineer who audits, fixes and verifies existing HTML, CSS and JavaScript. ' +
      'Use when the user asks for Chisel by name, or wants an existing page or component audited, fixed or ' +
      'refactored with the result checked in a browser. Not for designing new UI from scratch ' +
      '(responsive-ui-designer) or for review-only critique with no code changes (frontend-review skill).',
    claude: { model: 'sonnet', color: 'blue' },
  },
];

// The source's leading "# Title" line is dropped; each tool's metadata carries the name.
function instructions(sourceText) {
  return sourceText.replace(/^# .*\n+/, '').trimEnd() + '\n';
}

function claudeAgent(agent, sourceText) {
  const lines = ['---', `name: ${agent.name}`, `description: ${JSON.stringify(agent.description)}`];
  for (const [key, value] of Object.entries(agent.claude ?? {})) lines.push(`${key}: ${value}`);
  lines.push('---', '', instructions(sourceText));
  return lines.join('\n');
}

function codexAgent(agent, sourceText) {
  const text = instructions(sourceText);
  if (text.includes("'''")) {
    throw new Error(`${agent.source} contains ''' and cannot be embedded in a TOML literal string`);
  }
  // JSON string escapes are valid TOML basic-string escapes.
  return [
    `name = ${JSON.stringify(agent.name)}`,
    `description = ${JSON.stringify(agent.description)}`,
    "developer_instructions = '''",
    `${text}'''`,
    '',
  ].join('\n');
}

function outputs(agent) {
  return [
    {
      dist: join(root, 'dist/claude/agents', `${agent.name}.md`),
      installed: join(homedir(), '.claude/agents', `${agent.name}.md`),
      build: claudeAgent,
    },
    {
      dist: join(root, 'dist/codex/agents', `${agent.name}.toml`),
      installed: join(homedir(), '.codex/agents', `${agent.name}.toml`),
      build: codexAgent,
    },
  ];
}

const mode = process.argv[2] ?? '--build';
if (!['--build', '--install', '--check'].includes(mode)) {
  console.error('Usage: node tools/build-agents.mjs [--install | --check]');
  process.exit(2);
}

const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);
const stamp = new Date().toISOString().replace(/[:.]/g, '');
let outOfDate = 0;

for (const agent of agents) {
  const sourceText = readFileSync(join(root, agent.source), 'utf8');

  for (const output of outputs(agent)) {
    const expected = output.build(agent, sourceText);

    if (mode === '--check') {
      const built = readIfPresent(output.dist);
      const installed = readIfPresent(output.installed);
      if (built !== expected) {
        outOfDate += 1;
        console.log(`out of date: ${relative(root, output.dist)}`);
      } else {
        console.log(`ok: ${relative(root, output.dist)}`);
      }
      if (installed === null) console.log(`not installed: ${output.installed}`);
      else if (installed !== expected) {
        outOfDate += 1;
        console.log(`out of date: ${output.installed}`);
      } else console.log(`ok: ${output.installed}`);
      continue;
    }

    mkdirSync(dirname(output.dist), { recursive: true });
    writeFileSync(output.dist, expected);
    console.log(`built: ${relative(root, output.dist)}`);

    if (mode === '--install') {
      const current = readIfPresent(output.installed);
      if (current !== null && current !== expected) {
        const backup = `${output.installed}.bak-${stamp}`;
        copyFileSync(output.installed, backup);
        console.log(`backed up: ${backup}`);
      }
      mkdirSync(dirname(output.installed), { recursive: true });
      writeFileSync(output.installed, expected);
      console.log(`installed: ${output.installed}`);
    }
  }
}

if (outOfDate > 0) {
  console.error(`${outOfDate} file(s) out of date. Run: node tools/build-agents.mjs --install`);
  process.exit(1);
}
