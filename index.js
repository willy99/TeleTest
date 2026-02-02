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
            // Створюємо кімнату, але карти ще не відправляємо
            const deck = [...allIcons, ...allIcons].sort(() => Math.random() - 0.5);
            rooms[roomId] = {
                deck: deck,
                players: []
            };
        }

        // Додаємо гравця, якщо його ще немає в списку кімнати
        if (!rooms[roomId].players.includes(socket.id)) {
            rooms[roomId].players.push(socket.id);
        }

        console.log(`Кімната ${roomId}: гравців ${rooms[roomId].players.length}`);

        // Важливо: відправляємо ініціалізацію, ТІЛЬКИ коли є двоє
        if (rooms[roomId].players.length === 2) {
            // Надсилаємо ОБОМ гравцям у кімнаті сигнал старту
            io.to(roomId).emit('init_game', {
                deck: rooms[roomId].deck,
                firstTurn: rooms[roomId].players[0] // Перший, хто зайшов, той і ходить
            });
        }
    });

    socket.on('move', (data) => {
        // Пересилаємо хід супернику
        socket.to(data.roomId).emit('opponent_move', data);
    });

    socket.on('disconnect', () => {
        // Логіка видалення гравця з кімнати при виході (опціонально)
        for (const roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
        }
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