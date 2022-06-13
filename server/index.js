import express from "express";
import path from "path";
import { WebSocketServer } from "ws";

// Express static content
const port = 5200;
const app = express();
app.use("/", express.static("../front/public"));
app.listen(port, () => console.log(`Server running on port ${port}`))

// Websockets
const wsPort = 5201;
const ws = new WebSocketServer({ port: wsPort });
ws.on("connection", ws => {
  ws.on("message", message => {
    const body = JSON.parse(message);
    console.log(body)
  })
})
