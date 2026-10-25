// Script to verify a deployed live instance of KATA Car Dealership
// Usage: node scripts/verify_deployed_app.mjs <BASE_URL>
// Example: node scripts/verify_deployed_app.mjs https://kata-dealership.onrender.com

const targetUrl = process.argv[2] ? process.argv[2].replace(/\/+$/, '') : null;

if (!targetUrl) {
  console.error('❌ Error: Missing target URL.');
  console.error('Usage: node scripts/verify_deployed_app.mjs <HTTPS_URL>');
  process.exit(1);
}

console.log(`🔍 Verifying live deployed application at: ${targetUrl}\n`);

async function run() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  // 1. Root Frontend HTML Check
  console.log('1. Checking Frontend SPA Delivery...');
  try {
    const res = await fetch(`${targetUrl}/`);
    const text = await res.text();
    assert(res.status === 200, 'Frontend root / returns HTTP 200');
    assert(text.includes('<!doctype html>') || text.includes('<!DOCTYPE html>'), 'Frontend returns valid HTML document');
    assert(text.includes('/assets/index-') || text.includes('script'), 'Frontend loads compiled SPA bundle assets');
  } catch (err) {
    assert(false, `Frontend root check failed: ${err.message}`);
  }

  // 2. Health Endpoint Check
  console.log('\n2. Checking Backend Health Check...');
  try {
    const res = await fetch(`${targetUrl}/api/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'ok', 'Health check /api/health returns { status: "ok" }');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 3. User Registration
  console.log('\n3. Checking User Registration...');
  const testUsername = `user_${Date.now().toString(36)}`;
  const testEmail = `${testUsername}@testlive.com`;
  const testPassword = 'TestPassword123!';
  try {
    const res = await fetch(`${targetUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        password: testPassword,
      }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.email === testEmail, `Registered new user (${testUsername})`);
  } catch (err) {
    assert(false, `Registration failed: ${err.message}`);
  }

  // 4. User Login with Username
  console.log('\n4. Checking Login with Username & Token Issuance...');
  let userToken = '';
  try {
    const res = await fetch(`${targetUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: testUsername,
        password: testPassword,
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && !!data.token, 'Logged in using username and received JWT token');
    userToken = data.token;
  } catch (err) {
    assert(false, `User login failed: ${err.message}`);
  }

  // 5. Admin Login
  console.log('\n5. Checking Admin Login with Pre-Configured Seed Account...');
  let adminToken = '';
  try {
    const res = await fetch(`${targetUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernameOrEmail: 'admin',
        password: 'admin123',
      }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.user?.role === 'ADMIN', 'Admin login successful and role is ADMIN');
    adminToken = data.token;
  } catch (err) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  // 6. Inventory Loading
  console.log('\n6. Checking Inventory Catalog Loading...');
  let testVehicle = null;
  try {
    const res = await fetch(`${targetUrl}/api/vehicles`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const vehicles = await res.json();
    assert(res.status === 200 && Array.isArray(vehicles) && vehicles.length > 0, `Loaded inventory catalog (${vehicles.length} vehicles found)`);
    testVehicle = vehicles.find((v) => v.quantity > 0) || vehicles[0];
  } catch (err) {
    assert(false, `Inventory loading failed: ${err.message}`);
  }

  // 7. Search & Filter
  console.log('\n7. Checking Search & Filter Capabilities...');
  try {
    const res = await fetch(`${targetUrl}/api/vehicles/search?category=Coupe`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const coupes = await res.json();
    assert(res.status === 200 && Array.isArray(coupes), `Category filter search works (${coupes.length} Coupes found)`);
  } catch (err) {
    assert(false, `Search filter failed: ${err.message}`);
  }

  // 8. Purchasing & Atomic Stock Decrement
  console.log('\n8. Checking Purchase Transaction & Stock Decrement...');
  if (testVehicle) {
    const initialQty = testVehicle.quantity;
    try {
      const res = await fetch(`${targetUrl}/api/vehicles/${testVehicle.id}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const updated = await res.json();
      assert(res.status === 200 && updated.quantity === initialQty - 1, `Purchase successful: Stock decremented from ${initialQty} to ${updated.quantity}`);
    } catch (err) {
      assert(false, `Purchase failed: ${err.message}`);
    }
  }

  // 9. Database Persistence Check (Fetch again)
  console.log('\n9. Verifying Database Persistence...');
  if (testVehicle) {
    try {
      const res = await fetch(`${targetUrl}/api/vehicles`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const vehicles = await res.json();
      const persisted = vehicles.find((v) => v.id === testVehicle.id);
      assert(persisted && persisted.quantity === testVehicle.quantity - 1, 'Decremented stock persisted in database');
    } catch (err) {
      assert(false, `Persistence verification failed: ${err.message}`);
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('🎉 ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME VERIFICATION CHECKS FAILED.\n');
    process.exit(1);
  }
}

run();
