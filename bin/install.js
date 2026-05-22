#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const SKILL_NAME    = 'teams-maker';
const SKILL_CONTENT = fs.readFileSync(path.join(__dirname, '..', 'skill.md'), 'utf8');
const HOME          = os.homedir();

const TOOLS = [
  {
    name:     'Claude Code',
    rootDir:  path.join(HOME, '.claude'),
    skillDir: path.join(HOME, '.claude', 'skills'),
    type:     'dir',
  },
  {
    name:     'OpenCode',
    rootDir:  path.join(HOME, '.opencode'),
    skillDir: path.join(HOME, '.opencode', 'agents'),
    type:     'dir',
  },
  {
    name:     'Cursor',
    rootDir:  path.join(HOME, '.cursor'),
    skillDir: path.join(HOME, '.cursor', 'rules'),
    type:     'file',
    ext:      'mdc',
  },
  {
    name:     'Windsurf',
    rootDir:  path.join(HOME, '.codeium', 'windsurf'),
    skillDir: path.join(HOME, '.codeium', 'windsurf', 'memories'),
    type:     'dir',
  },
  {
    name:     'Continue.dev',
    rootDir:  path.join(HOME, '.continue'),
    skillDir: path.join(HOME, '.continue', 'rules'),
    type:     'file',
    ext:      'mdc',
  },
  {
    name:     'Goose',
    rootDir:  path.join(HOME, '.config', 'goose'),
    skillDir: path.join(HOME, '.config', 'goose', 'skills'),
    type:     'dir',
  },
  {
    name:     'Amp (Sourcegraph)',
    rootDir:  path.join(HOME, '.amp'),
    skillDir: path.join(HOME, '.amp', 'agents'),
    type:     'dir',
  },
];

const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
};

console.log(`\n${c.bold(`Installing skill: ${SKILL_NAME}`)}\n`);

let installed = 0;
let skipped   = 0;
let failed    = 0;

for (const tool of TOOLS) {
  const prefix = tool.name.padEnd(20);

  if (!fs.existsSync(tool.rootDir)) {
    console.log(`  ${c.yellow('⊘')}  ${prefix} ${c.dim('not detected')}`);
    skipped++;
    continue;
  }

  try {
    if (tool.type === 'dir') {
      const destDir = path.join(tool.skillDir, SKILL_NAME);
      fs.mkdirSync(destDir, { recursive: true });
      const dest = path.join(destDir, 'SKILL.md');
      fs.writeFileSync(dest, SKILL_CONTENT, 'utf8');
      console.log(`  ${c.green('✓')}  ${prefix} ${c.dim('→')} ${dest}`);
    } else {
      fs.mkdirSync(tool.skillDir, { recursive: true });
      const dest = path.join(tool.skillDir, `${SKILL_NAME}.${tool.ext}`);
      fs.writeFileSync(dest, SKILL_CONTENT, 'utf8');
      console.log(`  ${c.green('✓')}  ${prefix} ${c.dim('→')} ${dest}`);
    }
    installed++;
  } catch (err) {
    console.log(`  ${c.red('✗')}  ${prefix} ${c.red(err.message)}`);
    failed++;
  }
}

console.log(`
${c.bold('Done.')}  ${c.green(`${installed} installed`)}  ${c.yellow(`${skipped} skipped`)}  ${failed ? c.red(`${failed} failed`) : ''}
`);

if (installed === 0 && skipped === TOOLS.length) {
  console.log(c.yellow('  No supported AI tools detected in your home directory.\n'));
  process.exit(1);
}
