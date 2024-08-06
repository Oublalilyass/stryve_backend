// app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./config/database'); 
const textRoutes = require('./routes/textRoutes');
const authRoutes = require('./routes/authRoutes');
const Text = require('./models/Text'); // Import Text model
const http = require('http');
const WebSocket = require('ws');
const { authenticateToken, authorizeRole } = require('./middleware/authMiddleware'); // Import the middleware
const crypto = require('crypto'); // Ensure correct import
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Session store configuration
const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
}));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));

sessionStore.sync();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to handle session types
function sessionMiddleware(req, res, next) {
  if (!req.session.userType) {
    req.session.userType = 'Writer'; // Default session type
  }
  next();
}

app.use(sessionMiddleware);

// Register routes
app.use('/api/texts', textRoutes);
app.use('/api/auth', authRoutes);

// POST /upload endpoint
app.post('/upload', async (req, res) => {
  const { content, sessionType } = req.body;

  if (content && sessionType) {
    try {
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const newText = await Text.create({ content, sessionType, hash });

      // Notify WebSocket clients
      const message = JSON.stringify({ type: 'new-text', content });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.status(200).send({ message: 'Content uploaded successfully', data: newText });
    } catch (error) {
      console.error('Error saving to the database:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).send({ error: 'Missing content or sessionType' });
  }
});


// Endpoint to get texts based on sessionType with pagination
app.get('/texts', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const sessionType = req.session.userType; // Use the session type from the session

  const offset = (page - 1) * limit;

  try {
    const [results] = await sequelize.query(
      `SELECT * FROM texts WHERE sessionType = :sessionType LIMIT :limit OFFSET :offset`,
      {
        replacements: { sessionType, limit: parseInt(limit), offset: parseInt(offset) },
      }
    );

    const [countResults] = await sequelize.query(
      `SELECT COUNT(*) as count FROM texts WHERE sessionType = :sessionType`,
      {
        replacements: { sessionType },
      }
    );

    const totalTexts = countResults[0].count;

    res.json({ texts: results, totalTexts });
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// WebSocket server logic
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Serve static files
app.use(express.static('public'));

// Protected routes
app.use('/api/protected/writer', authenticateToken, authorizeRole('Writer'), (req, res) => {
  res.json({ message: 'Writer-specific content' });
});

app.use('/api/protected/publisher', authenticateToken, authorizeRole('Publisher'), (req, res) => {
  res.json({ message: 'Publisher-specific content' });
});

// Start the server
const PORT = 3308;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Database synchronization
sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
