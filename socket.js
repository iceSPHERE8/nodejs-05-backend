let io;

module.exports = {
    init: (httpServer) => {
        io = require("socket.io")(httpServer, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                credential: true,
            },
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("socket.io is not initialized!");
        }

        return io;
    },
};
