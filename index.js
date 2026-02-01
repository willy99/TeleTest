
const express = require('express');
const path = require('path'); // Додаємо цей модуль
const app = express();

// Кажемо серверу, що всі файли в папці "public" доступні публічно
app.use(express.static(path.join(__dirname, 'public')));

// Якщо користувач заходить на головну — віддаємо index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// Налаштовуємо CORS, щоб ваш сайт на Vercel міг підключитися
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Гравець підключився:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Гравець ${socket.id} зайшов у кімнату ${roomId}`);
    });

    socket.on('move', (data) => {
        // Пересилаємо хід іншому гравцю в цій же кімнаті
        socket.to(data.roomId).emit('opponent_move', data);
    });

    socket.on('disconnect', () => {
        console.log('Гравець відключився');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});