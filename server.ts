import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

app.use(express.json());

// API Health Check Endpoint (Render uses this for zero-downtime health probing)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Calypso · General Ledger & Billing',
    birCompliance: 'BIR RR 9-2009 & RA 11976 EOPT Compliant',
    casPermitNo: 'CAS-AC-2026-08491-BIR',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Production Static Assets Delivery
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Client-side SPA routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, host, () => {
  console.log(`[Calypso Engine] Server listening on http://${host}:${port}`);
  console.log(`[Calypso Engine] BIR CAS General Ledger & Billing ready for production traffic`);
});
