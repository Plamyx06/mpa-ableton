window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-delete-article]");
  const modal = document.getElementById("modal");
  const cancelButton = document.getElementById("btn-cancel");
  const deleteModalInput = document.getElementById("input-delete-article");
  const modalTitle = document.getElementById("modal-title");
  const defaultTitleText = modalTitle.innerText;

  for (const button of buttons) {
    button.addEventListener("click", () => {
      modal.style.display = "block";
      modal.setAttribute("modal-is-open", "true");
      const articleId = button.dataset.deleteArticle;
      const articleTitle = button.getAttribute("data-title-article");
      modalTitle.innerText += " " + articleTitle;
      deleteModalInput.setAttribute("value", articleId);
    });
  }
  cancelButton.addEventListener("click", () => {
    modalTitle.innerText = defaultTitleText;
    modal.style.display = "none";
    modal.setAttribute("modal-is-open", "false");
  });
});
