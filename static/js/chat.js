document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send");
  const chatInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chat");

  let pastMessages = [{role: "system", content: "Your name is ChatDziPiTi, you are a django assistant",}];

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
    if (chatInput.value === "" || chatInput.value === "\n") return;
    const message = chatInput.value;
    chatInput.value = "";

    const messageElement = document.createElement("div");
    messageElement.innerHTML = DOMPurify.sanitize(marked.parse(message));
    messageElement.classList.add("user-message");
    chatMessages.appendChild(messageElement);
    delete messageElement;

    pastMessages.push({role: "user", content: message});

    const thinkingMessageElement = document.createElement("div");
    thinkingMessageElement.innerText = "thinking...";
    thinkingMessageElement.classList.add("message");
    chatMessages.appendChild(thinkingMessageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch("https://johnny1029.pl/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama-3.1-8b-instruct",
        messages: pastMessages,
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
        pastMessages.push(data.choices[0].message);
        thinkingMessageElement.innerHTML = DOMPurify.sanitize(
          marked.parse(data.choices[0].message.content)
        );
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch((error) => {
        thinkingMessageElement.innerText =
          "An error occurred. Please try again.";
        console.error("Error:", error);
      });
  }
});
