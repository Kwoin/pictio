import express from "express";
import path from "path";
import { WebSocketServer } from "ws";
import { PictioWs } from "./ws/index.js";

// Express static content
const port = 5200;
const app = express();
app.use("/", express.static("../front/public"));
app.listen(port, () => console.log(`Server running on port ${port}`))

// Websockets
const wsPort = 5201;
const ws = new WebSocketServer({ port: wsPort });
const pictioWs = new PictioWs(ws);

