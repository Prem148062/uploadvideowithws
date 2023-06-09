const express = require("express");
const path = require("path");
const expressWs = require("express-ws");
const fs = require("fs");
const app = express();

expressWs(app);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.render("index.pug");
});

app.ws("/upload", (ws, req) => {
  ws.on("message", async (videobuffer) => {
    const videoPath = path.join(__dirname, `./public/temp/${+new Date()}`);
    await fs.promises.writeFile(videoPath, videobuffer);
    ws.send(JSON.stringify({ uploaded: true }));
  });
});

app.listen(3000, () => {
  console.log(`Express Starting at : http://localhost:3000`);
});
