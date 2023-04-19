window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("#btn-delete");
  const modal = document.getElementById("modal");
  const cancelButton = document.getElementById("btn-cancel");

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener("click", () => {
      modal.classList.remove("hidden");
      const confirmButton = document.getElementById("btn-delete-confirm");
      confirmButton.setAttribute("form", "form_" + i);
    });
  }

  cancelButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});
