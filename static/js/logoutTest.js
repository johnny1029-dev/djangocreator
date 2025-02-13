document.addEventListener("DOMContentLoaded", function () {
  let logoutButton = document.getElementById('logout');
  logoutButton.addEventListener('click', (event) => {
  event.preventDefault();
  fetch('/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = '/login/';
      } else {
        response.json().then((data) => {
          console.log(data);
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});
});