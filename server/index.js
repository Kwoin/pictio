import express from "express";
import { pictioWebsocketServer } from "./ws/index.js";
import * as path from "path";

// Express static content
const port = process.env.PORT ?? 5200;
const app = express();
app.use(express.static("../front/public"));

app.get('*', function (request, response) {
  response.sendFile(path.resolve('../front/public/index.html'));
});

const expressServer = app.listen(port, () => console.log(`Server running on port ${port}`))

const pictioWs = pictioWebsocketServer(expressServer);
