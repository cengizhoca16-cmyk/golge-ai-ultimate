const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup for Railway
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gölge AI System
const UltimateGolge = require('./golge-brain');
const golge = new UltimateGolge();

// Health Check for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    golge_status: 'active',
    version: '2.0',
    modules: 15,
    timestamp: new Date().toISOString()
  });
});

// Main page with Gölge interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌙 Ultimate Gölge AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: shadowPulse 2s infinite;
        }
        
        @keyframes shadowPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .title {
            font-size: 3rem;
            background: linear-gradient(45deg, #6366f1, #a855f7, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 15px;
            font-weight: bold;
        }
        
        .subtitle {
            font-size: 1.3rem;
            opacity: 0.9;
            color: #94a3b8;
            margin-bottom: 25px;
        }
        
        .status {
            display: inline-block;
            background: linear-gradient(45deg, #10b981, #059669);
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 1.1rem;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            animation: statusGlow 3s infinite;
        }
        
        @keyframes statusGlow {
            0%, 100% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 4px 25px rgba(16, 185, 129, 0.6); }
        }
        
        .chat-container {
            flex: 1;
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .chat-messages {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            min-height: 400px;
        }
        
        .messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 10px;
            max-height: 300px;
        }
        
        .message {
            margin-bottom: 15px;
            padding: 12px 18px;
            border-radius: 18px;
            max-width: 85%;
            word-wrap: break-word;
        }
        
        .user-message {
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            margin-left: auto;
            text-align: right;
        }
        
        .golge-message {
            background: linear-gradient(45deg, #6366f1, #4f46e5);
            margin-right: auto;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
        }
        
        .input-container {
            display: flex;
            gap: 10px;
        }
        
        .chat-input {
            flex: 1;
            padding: 15px 20px;
            border: none;
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            outline: none;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        
        .chat-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .chat-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        
        .send-btn {
            padding: 15px 25px;
            border: none;
            border-radius: 25px;
            background: linear-gradient(45deg, #6366f1, #4f46e5);
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .send-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }
        
        .modules-panel {
            min-width: 300px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            height: fit-content;
        }
        
        .module-item {
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        
        .module-item:hover {
            background: rgba(99, 102, 241, 0.2);
            transform: translateX(5px);
        }
        
        .module-icon {
            margin-right: 10px;
            font-size: 1.2rem;
        }
        
        .suggestions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .suggestion {
            padding: 8px 15px;
            background: rgba(99, 102, 241, 0.2);
            border: 1px solid rgba(99, 102, 241, 0.4);
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .suggestion:hover {
            background: rgba(99, 102, 241, 0.4);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .chat-container { flex-direction: column; }
            .modules-panel { min-width: auto; }
            .title { font-size: 2rem; }
            .logo { font-size: 3rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌙</div>
            <h1 class="title">Ultimate Gölge</h1>
            <p class="subtitle">AI Trading Assistant v2.0 - Railway Edition</p>
            <div class="status" id="status">🔄 Bağlanıyor...</div>
        </div>
        
        <div class="chat-container">
            <div class="chat-messages">
                <div class="messages" id="messages">
                    <div class="message golge-message">
                        🌙 Bağlantı kuruluyor... Gölge sistemi aktifleştiriliyor...
                    </div>
                </div>
                
                <div class="input-container">
                    <input type="text" class="chat-input" id="messageInput" 
                           placeholder="Gölge'ye mesaj yazın... (örn: THYAO'yu takip et)" 
                           maxlength="200">
                    <button class="send-btn" id="sendBtn">Gönder</button>
                </div>
                
                <div class="suggestions">
                    <div class="suggestion" onclick="sendSuggestion('THYAO takip et')">THYAO takip et</div>
                    <div class="suggestion" onclick="sendSuggestion('Portföy durumu')">Portföy durumu</div>
                    <div class="suggestion" onclick="sendSuggestion('Laboratuvar')">Laboratuvar</div>
                    <div class="suggestion" onclick="sendSuggestion('ASELS tahmini')">ASELS tahmini</div>
                </div>
            </div>
            
            <div class="modules-panel">
                <h3 style="margin-bottom: 20px; color: #6366f1;">🧠 Aktif Modüller</h3>
                
                <div class="module-item">
                    <span class="module-icon">🛡</span>
                    <span>Shadow Guardian</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">🧪</span>
                    <span>Evolution Chamber</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">🔮</span>
                    <span>Crystal Ball</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">📰</span>
                    <span>News Spider</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">📱</span>
                    <span>Social Radar</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">⚡</span>
                    <span>Flash Mode</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">🧠</span>
                    <span>Memory Palace</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">🎭</span>
                    <span>Personality Modes</span>
                </div>
                <div class="module-item">
                    <span class="module-icon">🏆</span>
                    <span>Achievement System</span>
                </div>
            </div>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const messages = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const status = document.getElementById('status');
        
        let connected = false;

        // Socket connection events
        socket.on('connect', () => {
            connected = true;
            status.innerHTML = '✅ Ultimate Gölge Aktif!';
            status.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            
            addMessage('🌙 Bağlantı kuruldu! Ultimate Gölge aktif ve hazır.', 'golge');
        });

        socket.on('disconnect', () => {
            connected = false;
            status.innerHTML = '🔄 Yeniden Bağlanıyor...';
            status.style.background = 'linear-gradient(45deg, #f59e0b, #d97706)';
        });

        // Gölge welcome message
        socket.on('golge-message', (data) => {
            addMessage(data.message, 'golge');
        });

        // Gölge responses
        socket.on('golge-response', (data) => {
            addMessage(data.message, 'golge');
        });

        // Send message function
        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || !connected) return;

            addMessage(message, 'user');
            socket.emit('user-message', {
                message: message,
                context: { timestamp: new Date() }
            });
            
            messageInput.value = '';
        }

        // Add message to chat
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = message ${sender}-message;
            messageDiv.innerHTML = text.replace(/\n/g, '<br>');
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Send suggestion
        function sendSuggestion(text) {
            if (!connected) return;
            messageInput.value = text;
            sendMessage();
        }

        // Event listeners
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Initialize
        setTimeout(() => {
            if (!connected) {
                status.innerHTML = '⚠ Bağlantı Problemi';
                status.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
            }
        }, 5000);
    </script>
</body>
</html>
  `);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🌙 Kullanıcı bağlandı:', socket.id);
  
  // Welcome message
  setTimeout(() => {
    socket.emit('golge-message', {
      message: `🌙 Merhaba! Ben Ultimate Gölge v2.0...

Railway'de yaşıyorum ve 15 modülüm aktif. Portföyünün koruyucusu olarak hizmetinizdeyim.

Hangi hisseyi takip etmemi istersin? Veya "laboratuvar" diyerek AI gelişimimi görebilirsin.

Sessizce bekliyorum...`,
      type: 'welcome',
      timestamp: new Date()
    });
  }, 1000);

  // Handle user messages
  socket.on('user-message', async (data) => {
    try {
      console.log('📥 Mesaj alındı:', data.message);
      const response = await golge.processUserInput(data.message, data.context || {});
      socket.emit('golge-response', response);
    } catch (error) {
      console.error('❌ Hata:', error);
      socket.emit('golge-response', {
        message: '🌙 Gölgelerimde bir sorun oluştu... Tekrar deneyin.',
        type: 'error',
        confidence: 0
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 Kullanıcı ayrıldı:', socket.id);
  });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'Ultimate Gölge AI',
    version: '2.0',
    platform: 'Railway',
    status: 'active',
    modules: 15,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🌙 ================================
   ULTIMATE GÖLGE v2.0 ACTIVE
🌙 ================================
🚀 Server: Railway Platform
🌐 Port: ${PORT}
⚡ Status: All systems online
🧠 Modules: 15 active
📊 AI Learning: Active
🔗 WebSocket: Ready
🌙 ================================
  `);
  
  // Initialize Gölge
  golge.initialize();
});
