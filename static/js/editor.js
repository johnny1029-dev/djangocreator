document.addEventListener("DOMContentLoaded", function () {
  fetch("/editor/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
      "mode": "same-origin",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      const fileList = document.getElementById("file-list");
      data.files.forEach((file) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "/editor/" + file.id;
        a.textContent = file.folder + file.name + "." + file.language;
        li.appendChild(a);
        fileList.appendChild(li);
      });
    })
    .catch((error) => console.error("Error fetching files:", error));

  const path = window.location.pathname;
  const pathParts = path.split("/");
  const fileId = pathParts.length > 2 ? pathParts[2] : null;

  if (fileId) {
    fetch("/editor/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
    })
      .then((response) => {
        document.getElementById("editor-textarea").removeAttribute("readonly");
        document.getElementById("save-button").removeAttribute("disabled");
        if (response.status === 401) {
          document.getElementById("editor-textarea").setAttribute("readonly", "true");
          document.getElementById("save-button").setAttribute("disabled", "true");
          return { content: "You are not authorized to view this file.", name: "Unauthorized", language: ""};
        }
        if (response.status === 404) {
          document.getElementById("editor-textarea").setAttribute("readonly", "true");
          document.getElementById("save-button").setAttribute("disabled", "true");
          return { content: "File does not exist.", name: "Not Found", language: "" };
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("editor-textarea").textContent = data.content;
        document.getElementById("filename").textContent = data.name + "." + data.language;
      })
      .catch((error) => console.error("Error fetching file:", error));
  }

  document.getElementById("save-button").addEventListener("click", function () {
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const fileId = pathParts.length > 2 ? pathParts[2] : null;
    const content = document.getElementById("editor-textarea").value;
    fetch("/save/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
      body: JSON.stringify({ content: content }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File saved");
      })
      .catch((error) => console.error("Error saving file:", error));
  });

  let error = false
  document.getElementById("new-file").addEventListener("click", function () {
    fetch("/new_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
      body: JSON.stringify({name: document.getElementById("file-name").value, language: document.getElementById("file-type").value}),
    })
      .then((response) => {
        if (response.status === 400) {
          error = true;
          return response.json();
        } 
        return response.json() 
      })
      .then((data) => {
        if (error) {
          console.error("Error creating new file", data);
          document.getElementById("editor-textarea").setAttribute("readonly", "true");
          document.getElementById("save-button").setAttribute("disabled", "true");
          document.getElementById("editor-textarea").textContent = "Error creating file: " + data.message;
          document.getElementById("filename").textContent = "Error";
          return;
        };
        window.location = "/editor/" + data.id;
      })
      .catch((error) => console.error("Error creating new file:", error));
  });
});

