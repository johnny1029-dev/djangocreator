document.addEventListener('DOMContentLoaded', function() {
  fetch('/editor/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
})
  .then(response => response.json())
  .then(data => {
    const fileList = document.getElementById('file-list');
    data.files.forEach(file => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = "/editor/" + file.id;
      a.textContent = file.folder + file.name + "." + file.language;
      li.appendChild(a);
      fileList.appendChild(li);
      });
  })
  .catch(error => console.error('Error fetching files:', error));

  const path = window.location.pathname;
  const pathParts = path.split('/');
  const fileId = pathParts.length > 2 ? pathParts[2] : null;

  if (fileId) {
    fetch('/editor/' + fileId + "/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.status === 401) {
        return {content: "You are not authorized to view this file."};
      }
      if (response.status === 404) {
        return {content: "File does not exist."};
      }
      return response.json() 
    })
    .then(data => {
      document.getElementById('editor-textarea').textContent = data.content;
    })
    .catch(error => console.error('Error fetching file:', error));
  }
});