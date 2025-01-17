const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3001;


const server = app.listen(PORT, () => {
    console.log(`Listening on PORT number ${PORT}`);
});


app.get(`/user/:number`, (req, res) => {
    //* Accessing the dynamic parameter from the URL 
    let number = req.params.number;
    let filePath = path.join(__dirname, `user-${number}.html`);
    res.sendFile(filePath);
});


const wss = new WebSocket.Server({
    server : server
});


let rooms = {};



wss.on("connection", (ws) => {

    //* Receive message from the client in JSON format 
    ws.on("message", (message) => {
        
        let obj = JSON.parse(message);

        //* Now, lets de-structure the contents of this object 
        const { OPERATION, ROOM_NUMBER, MSG } = obj;



        //* If a new client wants to join in a specific room 
        if(OPERATION === "join" && ROOM_NUMBER && MSG) {

            //* If the given room is not present then create that room
            if(!rooms[ROOM_NUMBER]) {
                rooms[ROOM_NUMBER] = [];
            }
            else {
                rooms[ROOM_NUMBER].push(ws);
                ws.send(`${MSG}`);
                console.log(`${MSG}`);
            }
        }
        

        //* Now, I receive the message from a specific client, and i want to broadcast his message to all the clients which are associated with his ROOM_NUMBER 
        else if(OPERATION === "message" && ROOM_NUMBER && MSG) {
            broadcast(ROOM_NUMBER, MSG);
        }
    });


    function broadcast(ROOM_NUMBER, MSG) {
        if(rooms[ROOM_NUMBER]) {
            rooms[ROOM_NUMBER].forEach((currClient) => {
                if(currClient.readyState === WebSocket.OPEN) {
                    currClient.send(MSG.toString());
                }
            });
        } 
    }
});