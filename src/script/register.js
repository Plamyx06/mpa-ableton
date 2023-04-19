window.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("btn-register");
  const password = document.getElementById("password");
  const password1 = document.getElementById("password1");
  const error = document.getElementById("error-password");
  const myForm = document.getElementById("form-register");

  registerButton.addEventListener("click", (event) => {
    if (!(password.value === password1.value)) {
      event.preventDefault();
      error.classList.remove("hidden");
      password.value = "";
      password1.value = "";
    } else {
      error.classList.add("hidden");
      myForm.submit();
    }
  });
});
