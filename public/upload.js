const formupload = document.getElementById("formupload");
const inputupload = document.getElementById("inputupload");
const progressUpload = document.getElementById("progressUpload");
const progressbarUpload = document.getElementById("progressbarUpload");

const ws = new WebSocket("ws://localhost:3000/upload");
ws.addEventListener("close", () => {
  alert("DISCONNECTED");
  location.reload();
});
ws.addEventListener("message", ({ data }) => {
  const { uploaded } = JSON.parse(data);
  if (uploaded) {
    inputupload.value = "";
    progressbarUpload.innerText = "SUCCESS";
    setTimeout(() => {
      progressUpload.classList.add("d-none");
    }, 5000);
  }
});
formupload.addEventListener("submit", (event) => {
  event.preventDefault();
  const file = inputupload.files[0];
  ws.send(file);
  progressUpload.classList.remove("d-none");
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
