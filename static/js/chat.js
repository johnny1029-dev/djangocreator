document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send");
  const chatInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chat");

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();
    chatInput.focus();
    sendMessage();
  });

  function sendMessage() {
    const message = chatInput.value;
    chatInput.value = "";

    if (message === "") {
      return;
    }

    const messageElement = document.createElement("div");
    messageElement.innerHTML = DOMPurify.sanitize(marked.parse(message));
    messageElement.classList.add("user-message");
    chatMessages.appendChild(messageElement);
    delete messageElement;

    const thinkingMessageElement = document.createElement("div");
    thinkingMessageElement.innerText = "thinking...";
    thinkingMessageElement.classList.add("message");
    chatMessages.appendChild(thinkingMessageElement);

    fetch("https://johnny1029.pl/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "Your name is ChatDziPiTi, you are a django assistant",
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
      }),
    })
      .then((response) => {
        if (response.ok) {
          if(response.status === 204) {
            return{choices: [{message: {content: "The server is offline. Please try again later."}}]};
          }
          return response.json();
        } else {
          return response.json().then((data) => {
            throw new Error(data);
          });
        }
      })
      .then((data) => {
        thinkingMessageElement.innerHTML = DOMPurify.sanitize(
          marked.parse(data.choices[0].message.content)
        );
      })
      .catch((error) => {
        thinkingMessageElement.innerText =
          "An error occurred. Please try again.";
        console.error("Error:", error);
      });
  }
});
