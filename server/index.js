import express from "express";
import { pictioWebsocketServer } from "./ws/index.js";
import * as path from "path";
import { gameRouter } from "./routes/game.js";

// Express static content
const port = process.env.PORT ?? 5200;
const app = express();
app.use("/api/game/", gameRouter);
app.use(express.static("../front/public"));
app.get('*', function (request, response) {
  response.sendFile(path.resolve('../front/public/index.html'));
});


const expressServer = app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`))

const pictioWs = pictioWebsocketServer(expressServer);
