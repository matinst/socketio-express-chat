const socket = io();
let typingTimer;
const clientsTotal = document.getElementById("client-total");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

socket.on("client-total", (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  if (messageInput.value == "") return alert("Message input cannot empty");
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToFront(true, data);
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  addMessageToFront(false, data);
});

function addMessageToFront(ownerMessage, data) {
  clearTyping();
  const element = `
    <li class=${ownerMessage ? "message-right" : "message-left"}>
          <p class="message">
            ${data.message}
            <span>${data.name} ● </span>
          </p>
        </li>
    `;
  messageContainer.innerHTML += element;
}

messageInput.addEventListener("keydown", (event) => {
  console.log(event.key);
  if (event.key === "Backspace") {
    clearTimeout(typingTimer);
    socket.emit("typing", {
      typing: `${nameInput.value} در حال تایپ کردن`,
    });
    typingTimer = setTimeout(() => {
      socket.emit("typing", {
        typing: "", // پاک کردن پیام تایپ
      });
    }, 5000);
    return;
  }
  clearTimeout(typingTimer);
  socket.emit("typing", {
    typing: `${nameInput.value} در حال تایپ کردن`,
  });
  typingTimer = setTimeout(() => {
    socket.emit("typing", {
      typing: "", // پاک کردن پیام تایپ
    });
  }, 5000);
});

messageInput.addEventListener("blur", (event) => {
  socket.emit("typing", {
    typing: "",
  });
});

socket.on("typing", (data) => {
  clearTyping();
  const element = `
    <li class="message-feedback">
          <p class="feedback" id="typing">${data.typing}</p>
        </li>
    `;

  messageContainer.innerHTML += element;
});

function clearTyping() {
  clearTimeout(typingTimer);
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
