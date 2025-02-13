document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send");
  const chatInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chat");

  sendButton.addEventListener("click", (event) => {
    event.preventDefault();

    const message = chatInput.value;

    fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.2-1b-instruct",
        messages: [
          { role: "system", content: "Always answer in rhymes. Today is Thursday" },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            throw new Error(data);
          });
        }
      })
      .then((data) => {
        chatInput.value = "";
        const messageElement = document.createElement("div");
        messageElement.innerText = data.choices[0].message.content;
        chatMessages.appendChild(messageElement);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});