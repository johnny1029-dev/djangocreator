document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Login successful");
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
