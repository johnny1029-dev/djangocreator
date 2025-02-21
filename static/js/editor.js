document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("editor-textarea");

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;

      // Set textarea value to: text before caret + tab + text after caret
      this.value =
        this.value.substring(0, start) + "\t" + this.value.substring(end);

      // Put caret at right position again
      this.selectionStart = this.selectionEnd = start + 1;
    }

    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveFile();
    }
  });

  const contextMenu = document.getElementById("context-menu");

  const menus = {
    menu1: [{ label: "Delete", action: deleteFile }],
  };

  document.addEventListener("contextmenu", function (event) {
    let target = event.target.closest(".context-target");
    if (!target) return;

    event.preventDefault();
    let menuType = target.getAttribute("data-menu");

    contextMenu.innerHTML = "";
    menus[menuType]?.forEach((item) => {
      let menuItem = document.createElement("div");
      menuItem.classList.add("context-menu-item");
      menuItem.textContent = item.label;
      menuItem.onclick = () => item.action(target);
      contextMenu.appendChild(menuItem);
    });

    contextMenu.style.display = "block";
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
  });

  document.addEventListener("click", function () {
    contextMenu.style.display = "none";
  });

  function updateFileList() {
    fetch("/editor/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        mode: "same-origin",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        const fileList = document.getElementById("file-list");
        const fileId = getFileId();
        fileList.innerHTML = "";
        data.files.forEach((file) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "/editor/" + file.id;
          li.textContent = file.folder + file.name + "." + file.language;
          a.appendChild(li);
          fileList.appendChild(a);
          a.setAttribute("data-menu", "menu1");
          a.classList.add("context-target");
          if (file.id == fileId) {
            li.classList.add("selected");
          }
        });
      })
      .catch((error) => console.error("Error fetching files:", error));
  }

  updateFileList();

  function getFileId() {
    const path = window.location.pathname;
    const pathParts = path.split("/");
    return pathParts.length > 2 ? pathParts[2] : null;
  }
  
  const fileId = getFileId();
  if (fileId) {
    fetch("/editor/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        mode: "same-origin",
      },
    })
      .then((response) => {
        textarea.removeAttribute("readonly");
        document.getElementById("save-button").removeAttribute("disabled");
        if (response.status === 401) {
          textarea.setAttribute("readonly", "true");
          document
            .getElementById("save-button")
            .setAttribute("disabled", "true");
          return {
            content: "You are not authorized to view this file.",
            name: "Unauthorized",
            language: "",
          };
        }
        if (response.status === 404) {
          textarea.setAttribute("readonly", "true");
          document
            .getElementById("save-button")
            .setAttribute("disabled", "true");
          return {
            content: "File does not exist.",
            name: "Not Found",
            language: "",
          };
        }
        return response.json();
      })
      .then((data) => {
        textarea.textContent = data.content;
        document.getElementById("filename").textContent =
          data.name + "." + data.language;
      })
      .catch((error) => console.error("Error fetching file:", error));
  }

  function saveFile() {
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const fileId = pathParts.length > 2 ? pathParts[2] : null;
    const content = textarea.value;
    fetch("/save/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        mode: "same-origin",
      },
      body: JSON.stringify({ content: content }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File saved");
      })
      .catch((error) => console.error("Error saving file:", error));
  }

  function deleteFile(target) {
    const fileId = target.href.split("/")[4];
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const currentId = pathParts.length > 2 ? pathParts[2] : null;
    fetch("/delete/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        mode: "same-origin",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File deleted");
        if (currentId === fileId) window.location = "/editor/";
        else updateFileList();
      })
      .catch((error) => console.error("Error deleting file:"));
  }

  document.getElementById("save-button").addEventListener("click", saveFile);

  let error = false;
  function createFile() {
    fetch("/new_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        mode: "same-origin",
      },
      body: JSON.stringify({
        name: document.getElementById("file-name").value,
        language: document.getElementById("file-type").value,
      }),
    })
      .then((response) => {
        if (response.status === 400) {
          error = true;
          return response.json();
        }
        return response.json();
      })
      .then((data) => {
        if (error) {
          console.error("Error creating new file", data);
          textarea.setAttribute("readonly", "true");
          document
            .getElementById("save-button")
            .setAttribute("disabled", "true");
          textarea.textContent = "Error creating file: " + data.message;
          document.getElementById("filename").textContent = "Error";
          return;
        }
        window.location = "/editor/" + data.id;
      })
      .catch((error) => console.error("Error creating new file:", error));
  }
  
  document.getElementById("new-file").addEventListener("click", function () {
    document.getElementById("context-menu-file").style.display = "flex";
  });

  document.getElementById("create").addEventListener("click", createFile);
  document.getElementById("close").addEventListener("click", function () {
    document.getElementById("context-menu-file").style.display = "none";
  });
});
