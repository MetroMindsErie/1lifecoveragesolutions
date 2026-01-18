import { spawn } from 'node:child_process';

function run(label, args) {
  const child = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[dev-all] ${label} exited (signal ${signal})`);
    } else {
      console.log(`[dev-all] ${label} exited (code ${code})`);
    }
  });

  return child;
}

// Start API first, then Vite.
const api = run('api', ['npm', 'run', 'dev:api']);

// Give the API a moment to bind its port before Vite starts proxying.
setTimeout(() => {
  run('web', ['npm', 'run', 'dev']);
}, 400);

function shutdown() {
  try { api.kill('SIGINT'); } catch {}
  // Let npm/vite handle SIGINT for the web process (it will also be interrupted by terminal SIGINT).
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
