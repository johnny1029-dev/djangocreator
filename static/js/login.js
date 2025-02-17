document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const urlParams = new URLSearchParams(window.location.search);
    const nextUrl = urlParams.get('next') || '/test/'; // Default redirect URL

    fetch("/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = nextUrl;
        } else {
          response.json().then((data) => {
            console.log(data);
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
