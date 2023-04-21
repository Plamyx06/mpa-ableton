window.addEventListener("DOMContentLoaded", () => {
  const registerButton = document.getElementById("btn-register");
  const password = document.getElementById("password");
  const password1 = document.getElementById("password1");
  const email = document.getElementById("email-address");
  const errorBlock = document.getElementById("error-password");
  const myForm = document.getElementById("form-register");
  const textError = document.getElementById("text-error");

  registerButton.addEventListener("click", (event) => {
    if (!(password.value === password1.value)) {
      event.preventDefault();
      errorBlock.classList.remove("hidden");
      password.value = "";
      password1.value = "";
      setTimeout(() => {
        errorBlock.classList.add("hidden");
      }, 3000);
    } else if (email.value.indexOf("@") === -1) {
      event.preventDefault();
      errorBlock.classList.remove("hidden");
      textError.textContent = "L'adresse e-mail est invalide.";
      setTimeout(() => {
        errorBlock.classList.add("hidden");
        textError.textContent =
          "Les mots de passe ne correspondent pas. Veuillez réessayer.";
      }, 3000);
    } else {
      errorBlock.classList.add("hidden");
      myForm.submit();
    }
  });
});
