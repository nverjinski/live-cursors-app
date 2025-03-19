
const http = require('http');
const { WebSocketServer } = require('ws');
const url = require('url');
const uuidv4 = require('uuid').v4;

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadcast = () => {
    Object.values(connections).forEach(connection => {
        connection.send(JSON.stringify(users));
    });
};

const handleMessage = (bytes, uuid) => {
    users[uuid].state = JSON.parse(bytes.toString());
    console.log(`User ${users[uuid].username} has updated their state to ${JSON.stringify(users[uuid].state)}`);
    broadcast();
};

const handleClose = (uuid) => {
    console.log(`User ${users[uuid].username} has disconnected`);
    delete connections[uuid]
    delete users[uuid];
    broadcast();
};

wsServer.on("connection", (connection, request) => {
    // ws://localhost:8000?username=Nate
    const { username } = url.parse(request.url, true).query;
    const uuid = uuidv4();
    console.log(`${username}, has connected`);

    connections[uuid] = connection;
    users[uuid] = {
        username,
        state: {
            x: 0,
            y: 0,
        },
    }

    connection.on("message", message => handleMessage(message, uuid));
    connection.on("close", () => handleClose(uuid))

})
server.listen(8000, () => {
    console.log(`WebSocket server is running on port ${port}`);
});
