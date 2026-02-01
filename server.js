const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const allIcons = ['🍎', '🍌', '🍒', '🥑', '🥦', '🍓', '🍋', '🍇', '🍉', '🍍', '🥭', '🥝', '🌽', '🥕', '🥔', '🍄', '🍔', '🍕'];
let rooms = {};

io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
        socket.join(roomId);

        // Якщо кімнати немає — створюємо її та генеруємо карти
        if (!rooms[roomId]) {
            const iconsForGame = allIcons.slice(0, 18); // Для сітки 6x6
            const deck = [...iconsForGame, ...iconsForGame].sort(() => Math.random() - 0.5);
            rooms[roomId] = {
                deck: deck,
                players: [],
                turn: 0
            };
        }

        rooms[roomId].players.push(socket.id);

        // Коли обоє зайшли — відправляємо карти обом
        if (rooms[roomId].players.length === 2) {
            io.to(roomId).emit('init_game', {
                deck: rooms[roomId].deck,
                firstTurn: rooms[roomId].players[0]
            });
        }
    });

    socket.on('move', (data) => {
        // Транслюємо хід супернику
        socket.to(data.roomId).emit('opponent_move', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));