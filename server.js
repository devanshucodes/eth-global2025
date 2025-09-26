const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Add Cross-Origin-Isolated headers for SharedArrayBuffer support
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Import routes
const agentRoutes = require('./routes/agents');
const ideaRoutes = require('./routes/ideas');
const tokenRoutes = require('./routes/tokens');
const financeRoutes = require('./routes/finance');

// Import Web3 service to initialize
const web3Service = require('./services/web3Service');

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/finance', financeRoutes);

// Serve static files from React app build
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Company server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 [SERVER] CLAUDE_API_KEY exists: ${!!process.env.CLAUDE_API_KEY}`);
  console.log(`🔑 [SERVER] CLAUDE_API_KEY length: ${process.env.CLAUDE_API_KEY?.length || 0}`);
});
