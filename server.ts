import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createApp } from './server/app';
import { getAi } from './server/ai/client';

dotenv.config();

const app = createApp();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const express = await import('express');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server running on http://localhost:${PORT} | Gemini: ${getAi() ? 'enabled' : 'disabled'}`,
    );
  });
}

startServer();
