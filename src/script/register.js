window.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("btn-register");
  const password = document.getElementById("password");
  const password1 = document.getElementById("password1");
  const errorBlock = document.getElementById("error-password");

  registerButton.addEventListener("click", (event) => {
    if (!(password.value === password1.value)) {
      event.preventDefault();
      errorBlock.classList.remove("hidden");
      password.value = "";
      password1.value = "";
      setTimeout(() => {
        errorBlock.classList.add("hidden");
      }, 3000);
    } else {
      errorBlock.classList.add("hidden");
    }
  });
});
