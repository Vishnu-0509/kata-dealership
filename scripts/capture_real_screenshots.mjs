import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Starting Backend Server on port 3001...');
  const backendProc = spawn('node', ['dist/server.js'], {
    cwd: path.resolve('backend'),
    env: { ...process.env, PORT: '3001', NODE_ENV: 'production' },
    shell: true,
    stdio: 'ignore',
  });

  console.log('🚀 Starting Frontend Vite Preview on port 5173...');
  const frontendProc = spawn('npm', ['run', 'preview', '--', '--port', '5173'], {
    cwd: path.resolve('frontend'),
    shell: true,
    stdio: 'ignore',
  });

  await sleep(3000);

  console.log('🌐 Launching Headless Chrome with Remote Debugging...');
  const tmpProfile = path.resolve('backend/prisma/temp-chrome-profile');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    `--user-data-dir=${tmpProfile}`,
    '--hide-scrollbars',
    '--window-size=1400,900',
    'about:blank',
  ]);

  await sleep(2500);

  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Connected to Chrome:', versionData['Browser']);

    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.value;
    }

    async function captureScreenshot(filename) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(SCREENSHOT_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      console.log(`📸 Saved screenshot: ${filename} (${Math.round((data.length * 0.75) / 1024)} KB)`);
    }

    await send('Page.enable');
    await send('DOM.enable');

    // 1. Login Page
    console.log('1. Navigating to Login Page...');
    await send('Page.navigate', { url: 'http://localhost:5173/login' });
    await sleep(2000);
    console.log('Page URL:', await evaluate('window.location.href'));
    await captureScreenshot('01-login-desktop.png');

    // 2. Click "Client Demo" and submit
    console.log('2. Clicking Client Demo quick fill and signing in...');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const clientBtn = btns.find(b => b.textContent.includes('Client Demo'));
        if (clientBtn) clientBtn.click();
      })()
    `);
    await sleep(500);

    await evaluate(`
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(3000);

    console.log('Page URL after login:', await evaluate('window.location.href'));
    console.log('Capturing Customer Dashboard...');
    await captureScreenshot('02-customer-dashboard.png');

    // 3. Open Specifications Comparison Modal
    console.log('3. Opening Specifications & Comparison Matrix...');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const compareBtn = btns.find(b => b.textContent.includes('Specifications & Compare'));
        if (compareBtn) compareBtn.click();
      })()
    `);
    await sleep(2000);
    await captureScreenshot('03-specifications-comparison.png');

    // Close comparison modal
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.textContent.includes('✕') || b.textContent.includes('Close'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(1000);

    // 4. Vehicle Acoustics & Inspection Modal
    console.log('4. Opening Vehicle Inspection & Acoustics Modal...');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const inspectBtn = btns.find(b => b.textContent.includes('Sound & Specs'));
        if (inspectBtn) inspectBtn.click();
      })()
    `);
    await sleep(2000);
    await captureScreenshot('04-vehicle-inspect-acoustics.png');

    // Close inspect modal
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.textContent.includes('✕') || b.textContent.includes('Close'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(1000);

    // 5. Filter for Out-of-Stock Vehicle (Rivian)
    console.log('5. Filtering for Out-of-Stock Vehicle (Rivian)...');
    await evaluate(`
      (() => {
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, 'Rivian');
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    await sleep(1500);
    await captureScreenshot('05-out-of-stock-state.png');

    // 6. Switch to Admin account
    console.log('6. Navigating to Login to sign in as Admin...');
    await evaluate(`
      (() => {
        localStorage.clear();
        window.location.href = '/login';
      })()
    `);
    await sleep(2000);

    console.log('Clicking Admin Demo quick fill and signing in...');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const adminBtn = btns.find(b => b.textContent.includes('Admin Demo'));
        if (adminBtn) adminBtn.click();
      })()
    `);
    await sleep(500);

    await evaluate(`
      (() => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      })()
    `);
    await sleep(3000);

    console.log('Admin Dashboard URL:', await evaluate('window.location.href'));
    await captureScreenshot('06-admin-inventory-management.png');

    // 7. Open Add New Vehicle Modal (Admin)
    console.log('7. Opening Add New Vehicle Modal...');
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.textContent.includes('Add New Vehicle'));
        if (addBtn) addBtn.click();
      })()
    `);
    await sleep(2000);
    await captureScreenshot('07-vehicle-create-modal.png');

    // Close create modal
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cancelBtn = btns.find(b => b.textContent.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();
      })()
    `);
    await sleep(1000);

    // 8. Mobile Viewport Responsive Capture
    console.log('8. Setting Mobile Viewport (390 x 844)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(2000);
    await captureScreenshot('08-mobile-dashboard.png');

    ws.close();
    console.log('🎉 All 8 authentic screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    console.log('Cleaning up background processes...');
    const killTree = (proc) => {
      if (proc && proc.pid) {
        try {
          execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
        } catch {}
      }
    };
    killTree(chromeProc);
    killTree(backendProc);
    killTree(frontendProc);
  }
}

run();
