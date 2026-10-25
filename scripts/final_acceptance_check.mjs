import { spawn, execSync } from 'child_process';
import path from 'path';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🏁 Starting End-to-End Final Acceptance Verification...\n');

  let failedChecks = [];

  function assertCheck(name, condition, extraInfo = '') {
    if (condition) {
      console.log(`✓ ${name}: PASSED ${extraInfo ? '(' + extraInfo + ')' : ''}`);
    } else {
      console.error(`✗ ${name}: FAILED ${extraInfo ? '(' + extraInfo + ')' : ''}`);
      failedChecks.push(name);
    }
  }

  function startServer() {
    return spawn('node', ['dist/server.js'], {
      cwd: path.resolve('backend'),
      env: { ...process.env, PORT: '3005', NODE_ENV: 'production' },
      shell: true,
      stdio: 'ignore',
    });
  }

  function killTree(proc) {
    if (proc && proc.pid) {
      try {
        execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
      } catch {}
    }
  }

  let server = startServer();
  await sleep(2500);

  const BASE_URL = 'http://localhost:3005';

  try {
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
      }),
    });
    const createdVehicle = await createRes.json();
    assertCheck('Vehicle Creation by Admin (201)', createRes.status === 201);

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

    // 10. Persistence Across Backend Restarts
    console.log('Restarting backend server process to verify SQLite persistence...');
    killTree(server);
    await sleep(2000);
    server = startServer();
    await sleep(2500);

    const afterRestartRes = await fetch(
      `${BASE_URL}/api/vehicles/search?make=Audi`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const afterRestartCars = await afterRestartRes.json();
    const persisted = afterRestartCars.find((c) => c.id === createdVehicle.id);
    assertCheck(
      'Persistence across backend restart',
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
    killTree(server);
    if (process.exitCode && process.exitCode !== 0) {
      process.exit(process.exitCode);
    }
  }
}

run();
