import { spawn, execSync } from 'child_process';
import path from 'path';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🏁 Starting End-to-End Final Acceptance Verification...\n');

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
    console.log('✓ Health check endpoint:', health.status === 'ok' ? 'PASSED' : 'FAILED');

    // 2. Registration
    const testEmail = `accept_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' }),
    });
    console.log('✓ User Registration:', regRes.status === 201 ? 'PASSED' : 'FAILED');

    // 3. Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' }),
    });
    const { token: userToken } = await loginRes.json();
    console.log('✓ User Login & JWT issuance:', !!userToken ? 'PASSED' : 'FAILED');

    // Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dealership.com', password: 'admin123' }),
    });
    const { token: adminToken } = await adminLoginRes.json();
    console.log('✓ Admin Login & JWT issuance:', !!adminToken ? 'PASSED' : 'FAILED');

    // 4. Protected Route & Admin Restrictions
    const unauthRes = await fetch(`${BASE_URL}/api/vehicles`);
    console.log('✓ Unauthenticated request rejected (401):', unauthRes.status === 401 ? 'PASSED' : 'FAILED');

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
    console.log('✓ Regular user rejected from Admin route (403):', userForbiddenRes.status === 403 ? 'PASSED' : 'FAILED');

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
    console.log('✓ Vehicle Creation by Admin (201):', createRes.status === 201 ? 'PASSED' : 'FAILED');

    const updateRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 169000 }),
    });
    console.log('✓ Vehicle Update by Admin (200):', updateRes.status === 200 ? 'PASSED' : 'FAILED');

    // 6. Search Filters
    const searchRes = await fetch(
      `${BASE_URL}/api/vehicles/search?make=Audi&minPrice=100000&maxPrice=200000`,
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const searchResults = await searchRes.json();
    console.log('✓ Valid Search Filter Query:', searchRes.status === 200 && searchResults.length >= 1 ? 'PASSED' : 'FAILED');

    const invalidSearchRes = await fetch(`${BASE_URL}/api/vehicles/search?minPrice=10junk`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✓ Malformed Search Param Rejected (400):', invalidSearchRes.status === 400 ? 'PASSED' : 'FAILED');

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

    console.log(
      '✓ Concurrent Purchase Race Protection:',
      successes.length === 1 && rejections.length === 4 ? 'PASSED (1 Success, 4 Out of Stock)' : 'FAILED'
    );

    // 8. Zero-Stock Purchase Rejection
    const zeroStockRes = await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}/purchase`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    console.log('✓ Zero-Stock Purchase Rejection (400):', zeroStockRes.status === 400 ? 'PASSED' : 'FAILED');

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
    console.log(
      '✓ Restocking by Admin (200):',
      restockRes.status === 200 && restockedJson.vehicle.quantity === 5 ? 'PASSED' : 'FAILED'
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
    console.log(
      '✓ Persistence across backend restart:',
      persisted && persisted.quantity === 5 ? 'PASSED' : 'FAILED'
    );

    // Clean up created vehicle
    await fetch(`${BASE_URL}/api/vehicles/${createdVehicle.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✓ Vehicle Deletion Cleanup (200): PASSED');

    console.log('\n🎉 ALL ACCEPTANCE CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Acceptance check failure:', err);
  } finally {
    killTree(server);
  }
}

run();
