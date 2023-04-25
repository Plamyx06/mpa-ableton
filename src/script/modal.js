/*window.addEventListener("DOMContentLoaded", () => {
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
});*/
window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-delete-article]");
  const modal = document.getElementById("modal");
  const cancelButton = document.getElementById("btn-cancel");
  const deleteModalInput = document.getElementById("input-delete-article");

  for (const button of buttons) {
    button.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.setAttribute("modal-is-open", "true");
      const articleId = button.dataset.deleteArticle;
      deleteModalInput.setAttribute("value", articleId);
    });
  }
  cancelButton.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("modal-is-open", "false");
  });
});
