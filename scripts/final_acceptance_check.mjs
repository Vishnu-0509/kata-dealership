import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const isWindows = os.platform() === 'win32';
const ACCEPTANCE_PORT = '3005';
const BASE_URL = `http://localhost:${ACCEPTANCE_PORT}`;
const ACCEPTANCE_DB_FILE = path.resolve('backend/prisma/acceptance.db');
const ACCEPTANCE_DB_URL = 'file:./acceptance.db';

// Clean acceptance database files
function cleanAcceptanceDb() {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const f = `${ACCEPTANCE_DB_FILE}${suffix}`;
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {}
    }
  }
}

// Kill process and process tree cross-platform
function killProc(proc) {
  if (!proc || !proc.pid) return;
  if (isWindows) {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  } else {
    try {
      // Send SIGKILL to the process group if detached, otherwise direct SIGKILL
      process.kill(-proc.pid, 'SIGKILL');
    } catch {
      try {
        proc.kill('SIGKILL');
      } catch {}
    }
  }
}

// Stop server and await confirmed termination
async function stopServer(proc) {
  if (!proc) return;
  killProc(proc);

  // Poll until server stops responding to HTTP health checks
  const start = Date.now();
  while (Date.now() - start < 5000) {
    try {
      await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(400) });
      await sleep(150);
    } catch {
      // Connection refused means server process has cleanly terminated
      return;
    }
  }
}

// Start server on dedicated acceptance port with isolated database
function startServer() {
  const proc = spawn('node', ['dist/server.js'], {
    cwd: path.resolve('backend'),
    env: {
      ...process.env,
      PORT: ACCEPTANCE_PORT,
      DATABASE_URL: ACCEPTANCE_DB_URL,
      NODE_ENV: 'production',
      JWT_SECRET: process.env.JWT_SECRET || 'acceptance-test-jwt-secret-secure-32chars',
    },
    shell: isWindows,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stderr?.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('EADDRINUSE')) {
      console.error(`❌ Port ${ACCEPTANCE_PORT} already in use!`);
    }
  });

  return proc;
}

// Poll readiness endpoint with timeout
async function waitForHealth(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(500) });
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'ok') return true;
      }
    } catch {
      // Retry
    }
    await sleep(200);
  }
  throw new Error(`Server failed to become healthy on port ${ACCEPTANCE_PORT} within ${timeoutMs}ms`);
}

async function run() {
  console.log('🏁 Starting End-to-End Final Acceptance Verification...\n');

  let failedChecks = [];
  let currentServer = null;

  function assertCheck(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`✓ ${name}: PASSED ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
      console.error(`✗ ${name}: FAILED ${extraInfo ? '(' + extraInfo + ')' : ''}`);
      failedChecks.push(name);
    }
  }

  const cleanup = () => {
    if (currentServer) {
      killProc(currentServer);
      currentServer = null;
    }
    cleanAcceptanceDb();
  };

  process.on('SIGINT', () => {
    cleanup();
    process.exit(1);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(1);
  });

  try {
    // 0. Setup isolated acceptance database using migrations
    console.log('📦 Initializing isolated acceptance database from migrations...');
    cleanAcceptanceDb();
    execSync('npx prisma migrate deploy', {
      cwd: path.resolve('backend'),
      env: {
        ...process.env,
        DATABASE_URL: ACCEPTANCE_DB_URL,
      },
      stdio: 'pipe',
    });

    // Seed initial demo accounts in acceptance db
    execSync('npm run seed', {
      cwd: path.resolve('backend'),
      env: {
        ...process.env,
        DATABASE_URL: ACCEPTANCE_DB_URL,
      },
      stdio: 'pipe',
    });

    console.log('🚀 Launching backend server...');
    currentServer = startServer();
    await waitForHealth();

    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    assertCheck('Health check endpoint', health.status === 'ok');

    // 2. Registration with Username and Email
    const testEmail = `accept_${Date.now()}@test.com`;
    const testUsername = `user_${Date.now()}`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, username: testUsername, password: 'password123' }),
    });
    assertCheck('User Registration with unique username', regRes.status === 201);

    // 3. Login using username
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: testUsername, password: 'password123' }),
    });
    const { token: userToken } = await loginRes.json();
    assertCheck('User Login with username & JWT issuance', !!userToken);

    // Admin Login using username 'admin'
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: 'admin', password: 'admin123' }),
    });
    const { token: adminToken } = await adminLoginRes.json();
    assertCheck('Admin Login with username & JWT issuance', !!adminToken);

    // 4. Protected Route & Admin Restrictions
    const unauthRes = await fetch(`${BASE_URL}/api/vehicles`);
    assertCheck('Unauthenticated request rejected (401)', unauthRes.status === 401);

    const userForbiddenRes = await fetch(`${BASE_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        make: 'Audi',
        model: 'R8 V10',
        category: 'Coupe',
        price: 158000,
        quantity: 1,
      }),
    });
    assertCheck('Regular user rejected from Admin route (403)', userForbiddenRes.status === 403);

    // 5. Vehicle CRUD by Admin
    const createRes = await fetch(`${BASE_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        make: 'Audi',
        model: 'R8 V10 Performance',
        category: 'Coupe',
        price: 165000,
        quantity: 1,
        images360: JSON.stringify(['https://example.com/r8_01.jpg', 'https://example.com/r8_02.jpg']),
      }),
    });
    const createdVehicle = await createRes.json();
    assertCheck('Vehicle Creation with 360 images by Admin (201)', createRes.status === 201 && createdVehicle.images360?.includes('r8_01.jpg'));

    const updateRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 169000 }),
    });
    assertCheck('Vehicle Update by Admin (200)', updateRes.status === 200);

    // 6. Search Filters & Price Validation
    const searchRes = await fetch(
      `${BASE_URL}/api/vehicles/search?make=Audi&minPrice=100000&maxPrice=200000`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const searchResults = await searchRes.json();
    assertCheck('Valid Search Filter Query', searchRes.status === 200 && Array.isArray(searchResults) && searchResults.length >= 1);

    const invalidSearchRes = await fetch(`${BASE_URL}/api/vehicles/search?minPrice=10junk`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assertCheck('Malformed Search Param Rejected (400)', invalidSearchRes.status === 400);

    const infinitySearchRes = await fetch(`${BASE_URL}/api/vehicles/search?minPrice=Infinity`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assertCheck('Infinity Price Param Rejected (400)', infinitySearchRes.status === 400);

    // 7. Atomic Concurrency Purchase (5 requests against 1 stock)
    console.log('Simulating 5 simultaneous purchases against 1 available unit...');
    const purchaseReqs = Array.from({ length: 5 }, () =>
      fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      })
    );
    const purchaseResponses = await Promise.all(purchaseReqs);
    const successes = purchaseResponses.filter((r) => r.status === 200);
    const rejections = purchaseResponses.filter((r) => r.status === 400);

    assertCheck(
      'Concurrent Purchase Race Protection',
      successes.length === 1 && rejections.length === 4,
      `1 Success, 4 Out of Stock`
    );

    // 8. Zero-Stock Purchase Rejection
    const zeroStockRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}/purchase`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assertCheck('Zero-Stock Purchase Rejection (400)', zeroStockRes.status === 400);

    // 9. Restock by Admin
    const restockRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ quantity: 5 }),
    });
    const restockedJson = await restockRes.json();
    assertCheck(
      'Restocking by Admin (200)',
      restockRes.status === 200 && restockedJson.vehicle?.quantity === 5
    );

    // 10. Persistence Across Real Process Restart
    console.log('Restarting backend server process to verify SQLite persistence across process lifecycle...');
    await stopServer(currentServer);
    currentServer = startServer();
    await waitForHealth();

    const afterRestartRes = await fetch(
      `${BASE_URL}/api/vehicles/search?make=Audi`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const afterRestartCars = await afterRestartRes.json();
    const persisted = afterRestartCars.find((c) => c.id === createdVehicle.id);
    assertCheck(
      'Persistence across real backend process restart',
      Boolean(persisted && persisted.quantity === 5)
    );

    // Clean up created vehicle
    const deleteRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertCheck('Vehicle Deletion Cleanup (200)', deleteRes.status === 200);

    if (failedChecks.length > 0) {
      console.error(`\n❌ ${failedChecks.length} ACCEPTANCE CHECK(S) FAILED:`);
      failedChecks.forEach((name) => console.error(`  - ${name}`));
      process.exitCode = 1;
    } else {
      console.log('\n🎉 ALL ACCEPTANCE CHECKS PASSED SUCCESSFULLY!');
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Acceptance check execution error:', err);
    process.exitCode = 1;
  } finally {
    cleanup();
    if (process.exitCode && process.exitCode !== 0) {
      process.exit(process.exitCode);
    }
  }
}

run();
