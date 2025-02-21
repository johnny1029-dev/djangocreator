document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("signupForm");

  toastr.options = {
    closeButton: false,
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

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        "mode": "same-origin",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        if (response.ok) window.location.href = "/editor/";
        else
          response
            .json()
            .then((data) => toastr["error"](data.message, "Error"));
      })
      .catch((error) => console.error("Error:", error));
  });
});
