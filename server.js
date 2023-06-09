const express = require("express");
const path = require("path");
const expressWs = require("express-ws");
const resizeVideo = require("./utils/resizeVideo");
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
    const filename = +new Date();
    const videoPath = path.join(__dirname, `./public/temp/${filename}`);
    await fs.promises.writeFile(videoPath, videobuffer);
    ws.send(JSON.stringify({ uploaded: true }));
    const sizes = [480, 360];
    const result = [];
    for (const size of sizes) {
      const outputUrl = `/${filename}-${size}.mp4`;
      const outputPath = path.join(__dirname, `./public${outputUrl}`);
      await resizeVideo(videoPath, size, outputPath);
      result.push(outputPath);
    }
    ws.send(JSON.stringify({ resized: true, result }));
  });
});

app.listen(3000, () => {
  console.log(`Express Starting at : http://localhost:3000`);
});
