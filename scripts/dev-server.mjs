import http from 'node:http';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const require = createRequire(import.meta.url);
const attachSocketServer = require('../socket-server');

function getCliPort() {
  const portIndex = process.argv.indexOf('--port');

  if (portIndex > -1 && process.argv[portIndex + 1]) {
    return process.argv[portIndex + 1];
  }

  const portArg = process.argv.find((arg) => arg.startsWith('--port='));

  if (portArg) {
    return portArg.split('=')[1];
  }

  return undefined;
}

const host = '0.0.0.0';
const port = Number(getCliPort() || process.env.PORT || 5174);
const app = express();
const server = http.createServer(app);
const indexPath = path.resolve(process.cwd(), 'index.html');
const reactRefreshPreamble = `
    <script type="module">
      import RefreshRuntime from '/@react-refresh';

      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
    </script>`;

function ensureReactRefreshPreamble(html) {
  if (html.includes('__vite_plugin_react_preamble_installed__')) {
    return html;
  }

  return html.replace('</head>', `${reactRefreshPreamble}\n  </head>`);
}

attachSocketServer(server);

const vite = await createViteServer({
  appType: 'custom',
  server: {
    hmr: {
      server,
    },
    middlewareMode: true,
  },
});

app.use(vite.middlewares);

app.use(async (req, res, next) => {
  if (req.method !== 'GET' || req.originalUrl.startsWith('/socket.io')) {
    next();
    return;
  }

  try {
    const template = await fs.readFile(indexPath, 'utf-8');
    const html = ensureReactRefreshPreamble(
      await vite.transformIndexHtml(req.originalUrl, template)
    );
    res.status(200).type('html').send(html);
  } catch (error) {
    vite.ssrFixStacktrace(error);
    next(error);
  }
});

server.listen(port, host, () => {
  console.log(`Running Vite and Socket.IO on http://localhost:${port}`);
});

function shutdown() {
  server.closeAllConnections?.();
  server.close(async () => {
    await vite.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(0), 1000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
