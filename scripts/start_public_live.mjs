import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const port = process.env.PORT || '3005';
console.log(`🚀 Starting KATA Car Dealership Production Server on port ${port}...`);

const backendEnv = {
  ...process.env,
  PORT: port,
  NODE_ENV: 'production',
  DATABASE_URL: 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'a-very-strong-production-cryptographic-secret-key-32chars',
};

const serverProcess = spawn('node', ['dist/server.js'], {
  cwd: path.resolve(rootDir, 'backend'),
  env: backendEnv,
  stdio: 'inherit',
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Wait for health endpoint
async function waitForHealth(retries = 25) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) {
        console.log(`✓ Unified Express Server is healthy on http://127.0.0.1:${port}`);
        return true;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Server did not become healthy in time.');
}

async function main() {
  await waitForHealth();

  console.log('\n🌐 Establishing Cloudflare Public HTTPS Edge Tunnel...');
  const cloudflaredPath = path.resolve(rootDir, 'scripts/cloudflared.exe');

  const tunnel = spawn(cloudflaredPath, ['tunnel', '--url', `http://127.0.0.1:${port}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let tunnelUrl = null;

  function handleData(chunk) {
    const text = chunk.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[0];
      console.log('\n============================================================');
      console.log(`🎉 LIVE PUBLIC HTTPS URL GENERATED:`);
      console.log(`👉 ${tunnelUrl}`);
      console.log('============================================================\n');
      fs.writeFileSync(path.resolve(rootDir, 'scripts/LIVE_URL.txt'), tunnelUrl);
    }
  }

  tunnel.stdout.on('data', handleData);
  tunnel.stderr.on('data', handleData);

  tunnel.on('close', (code) => {
    console.log(`Tunnel closed with code ${code}`);
    serverProcess.kill();
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    tunnel.kill();
    serverProcess.kill();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Error starting live tunnel:', err);
  serverProcess.kill();
  process.exit(1);
});
