const express = require("express");
const path = require("path");
const expressWs = require("express-ws");
const resizeVideo = require("./utils/resizeVideo");
const Queue = require("bull");
const fs = require("fs");
const { find } = require("lodash");

const videoQueue = new Queue("videoQueue", "redis://127.0.0.1:6379");
videoQueue.process(async (job, next) => {
  const { id, videoPath, size, outputPath, outputUrl, lastJob } = job.data;
  const ws = find(Array.from(wss.clients), { id });
  if (!ws) {
    throw new Error("ws is missing");
  }
  //console.log("from bull job -->", id, "\n from wss --> ", wss.clients);
  await resizeVideo(videoPath, size, outputPath);
  ws.send(JSON.stringify({ lastJob, url: outputUrl }));
  if (lastJob) {
    await fs.promises.unlink(videoPath);
  }
  next();
});
const app = express();
const wss = expressWs(app).getWss();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  res.render("index.pug");
});

app.ws("/upload", (ws, req) => {
  const filename = +new Date();
  ws.id = filename;
  ws.on("message", async (videobuffer) => {
    const videoPath = path.join(__dirname, `./public/temp/${filename}`);
    await fs.promises.writeFile(videoPath, videobuffer);
    ws.send(JSON.stringify({ uploaded: true }));
    const sizes = [480, 360];
    let c = 0;
    for (const size of sizes) {
      c++;
      const outputUrl = `/${filename}-${size}.mp4`;
      const outputPath = path.join(__dirname, `./public${outputUrl}`);
      videoQueue.add({
        id: ws.id,
        videoPath,
        size,
        outputPath,
        outputUrl,
        lastJob: c == sizes.length,
      });
    }
    // const sizes = [480, 360];
    // const result = [];
    // for (const size of sizes) {
    //   await resizeVideo(videoPath, size, outputPath);
    //   result.push(outputPath);
    // }
    // ws.send(JSON.stringify({ resized: true, result }));
  });
});

app.listen(3000, () => {
  console.log(`Express Starting at : http://localhost:3000`);
});
