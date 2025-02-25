document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.getElementById("editor-textarea");

  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  };

  function showFileCreationDialog(){
    Swal.fire({
      title: 'New file',
      html:
        `<input id="file-name" class="swal2-input" placeholder="filename">
        <select name="file-type" id="file-type">
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="js">JavaScript</option>
        <option value="py">Python</option>
        </select>`,
      focusConfirm: false,
      preConfirm: createFile
    });
  }

  async function deleteConfirm(){
    del = false;
    await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.value) {
        del = true;
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
    return del;
  }

  textarea.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      // Set textarea value to: text before caret + tab + text after caret
      this.value =
        this.value.substring(0, start) + "\t" + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1; // Put caret at right position again
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
        "mode": "same-origin",
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
      .catch((error) => toastr["error"](error, "Error fetching files"));
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
        "mode": "same-origin",
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
      .catch((error) => toastr["error"](error, "Error fetching file"));
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
        "mode": "same-origin",
      },
      body: JSON.stringify({ content: content }),
    })
      .then((response) => response.json())
      .then(() => {
        toastr["success"]("File saved");
      })
      .catch((error) => toastr["error"](error, "Error saving file"));
  }

  async function deleteFile(target) {
    const del = await deleteConfirm();
    if (!del) return;
    const fileId = target.href.split("/")[4];
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const currentId = pathParts.length > 2 ? pathParts[2] : null;
    fetch("/delete/" + fileId + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
    })
      .then((response) => response.json())
      .then(() => {
        console.log("File deleted");
        updateFileList();
        if (currentId === fileId) {
          textarea.textContent = "";
          textarea.setAttribute("readonly", "true");
          document
            .getElementById("save-button")
            .setAttribute("disabled", "true");
          history.pushState(null, "", "/editor/");
          document.getElementById("filename").textContent = "Open a file";
        }
      })
      .catch((error) => toastr["error"](error, "Error deleting file"));
  }

  document.getElementById("save-button").addEventListener("click", saveFile);

  function createFile() {
    let error = false;
    fetch("/new_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
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
          toastr["error"](data.message, "Error creating file");
          return;
        }
        updateFileList();
        toastr["success"]("File created");
      })
      .catch((error) => toastr["error"](error, "Error creating file"));
  }

  document.getElementById("new-file").addEventListener("click", showFileCreationDialog);
});
