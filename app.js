const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const api_error = require('./utils/api_error');
const database = require('./config/data_base');
const session = require('express-session');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');

// Security & Performance Middleware
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const compression = require('compression');

// Routes
const auth_route = require('./routes/auth_route');
dotenv.config();
require('./config/passport');
const vedio_route = require('./routes/vedio_route');
const image_route = require('./routes/image_route');
const like_route = require('./routes/like_route');
const comment_route = require('./routes/comment_route');
const user_route = require('./routes/user_route');
const favorite_route = require('./routes/favorite_route');
const conversation_route = require('./routes/conversation_route');
const message_route = require('./routes/message_route');
const socketHandler = require('./services/socket_handler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
socketHandler(io);

// Security & Performance Middleware
app.use(cors());
app.options('/*any', cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  
  next();
});

app.use(hpp());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, 
  message: 'Too many requests from this IP, please try again later.'
}));

// Session & Passport
app.use(session({
  secret: 'tiktok_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to the database
database();

// Timeout middleware
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 دقيقة
  next();
});

// Routes
app.use('/api/v1/videos', vedio_route);
app.use('/api/v1/images', image_route);
app.use('/api/v1/likes', like_route);
app.use('/api/v1/comments', comment_route);
app.use('/api/v1/auth', auth_route);
app.use('/api/v1/favorite', favorite_route);
app.use('/api/v1/users', user_route);
app.use('/api/v1/conversations', conversation_route);
app.use('/api/v1/messages', message_route);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});