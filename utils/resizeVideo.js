var ffmpeg = require("fluent-ffmpeg");
module.exports = (videoPath, size, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath)
      .videoCodec("libx264")
      .format("mp4")
      .size(`?x${size}`)
      .on("error", reject)
      .on("end", resolve)
      .save(outputPath);
  });
};
