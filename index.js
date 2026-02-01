const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Налаштування статичних файлів (папка public)
app.use(express.static(path.join(__dirname, 'public')));

const allIcons = ['🍎', '🍌', '🍒', '🥑', '🥦', '🍓', '🍋', '🍇', '🍉', '🍍', '🥭', '🥝', '🌽', '🥕', '🥔', '🍄', '🍔', '🍕'];
let rooms = {};

io.on('connection', (socket) => {
    console.log('Гравець підключився:', socket.id);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            // Створюємо колоду тільки для першого гравця
            const deck = [...allIcons, ...allIcons].sort(() => Math.random() - 0.5);
            rooms[roomId] = { deck, players: [] };
        }

        rooms[roomId].players.push(socket.id);

        // Коли в кімнаті двоє — починаємо гру
        if (rooms[roomId].players.length === 2) {
            io.to(roomId).emit('init_game', {
                deck: rooms[roomId].deck,
                firstTurn: rooms[roomId].players[0]
            });
        }
    });

    socket.on('move', (data) => {
        // Транслюємо хід іншому гравцю
        socket.to(data.roomId).emit('opponent_move', data);
    });

    socket.on('disconnect', () => {
        console.log('Гравець відключився');
    });
});

// Роут для віддачі сторінки
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});