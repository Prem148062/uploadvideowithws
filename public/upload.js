const formupload = document.getElementById("formupload");
const submitbtn = document.getElementById("submitbtn");
const inputupload = document.getElementById("inputupload");
const progressUpload = document.getElementById("progressUpload");
const progressbarUpload = document.getElementById("progressbarUpload");
const listupload = document.getElementById("listupload");

const ws = new WebSocket("ws://localhost:3000/upload");
let urls = [];

ws.addEventListener("close", () => {
  alert("DISCONNECTED");
  location.reload();
});
ws.addEventListener("message", ({ data }) => {
  const { uploaded, url, lastJob } = JSON.parse(data);
  if (uploaded) {
    progressbarUpload.classList.add("bg-warning");
    progressbarUpload.innerHTML = "PEOCESS VIDEO PLEASE WAIT ... ";
  }
  if (url) {
    urls.push(url);
  }
  if (lastJob) {
    inputupload.value = "";
    progressbarUpload.classList.remove("progress-bar-striped");
    progressbarUpload.classList.remove("progress-bar-animated");
    progressbarUpload.classList.remove("bg-warning");
    progressbarUpload.classList.add("bg-success");
    progressbarUpload.innerText = "UPLOADED SUCCESS";
    submitbtn.disabled = false;
    inputupload.disabled = false;
    for (const url of urls) {
      const li = document.createElement("li");
      li.innerText = url;
      listupload.append(li);
    }
    setTimeout(() => {
      progressUpload.classList.add("d-none");
    }, 5000);
  }
});
formupload.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = inputupload.files[0];
  submitbtn.disabled = true;
  inputupload.disabled = true;
  urls = [];
  ws.send(file);
  progressUpload.classList.remove("d-none");
  progressbarUpload.classList.remove("bg-success");
  progressbarUpload.classList.add("progress-bar-striped");
  progressbarUpload.classList.add("progress-bar-animated");
  progressbarUpload.classList.add("bg-warning");
  listupload.innerHTML = "";
  const uploadInterver = setInterval(() => {
    const percentage = Math.round(
      ((file.size - ws.bufferedAmount) / file.size) * 100
    );
    progressbarUpload.style.width = `${percentage}%`;
    progressbarUpload.innerText = `${percentage}%`;
    if (ws.bufferedAmount <= 0) {
      clearInterval(uploadInterver);
    }
  }, 1);
});
