const io = require("socket.io")(3000, { cors: { origin: "*" } });

let rooms = {};

io.on("connection", (socket) => {
    socket.on("joinGame", (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            rooms[roomId] = { players: [], state: "waiting" };
        }
        rooms[roomId].players.push(socket.id);

        if (rooms[roomId].players.length === 2) {
            io.to(roomId).emit("startGame", { firstPlayer: rooms[roomId].players[0] });
        }
    });

    socket.on("cardFlip", (data) => {
        // Пересилаємо іншому гравцю, яку карту відкрили
        socket.to(data.roomId).emit("opponentFlip", data.cardIndex);
    });
});