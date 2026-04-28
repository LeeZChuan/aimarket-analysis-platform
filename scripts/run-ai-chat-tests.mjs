import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';

const outfile = join(tmpdir(), `ai-chat-flow-test-${Date.now()}.mjs`);

await build({
  entryPoints: ['tests/aiChatFlow.test.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
});

const result = spawnSync(process.execPath, [outfile], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
