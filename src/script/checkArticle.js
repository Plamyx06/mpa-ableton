document.addEventListener("DOMContentLoaded", async () => {
  const titleInput = document.getElementById("title");

  titleInput.addEventListener("input", function () {
    if (titleInput.value.length >= 3) {
      titleInput.classList.remove("focus:ring-red-600");
      titleInput.classList.add("focus:ring-green-600");
      titleInput.classList.remove("ring-red-300");
      titleInput.classList.add("ring-green-600");
    } else {
      titleInput.classList.remove("focus:ring-green-600");
      titleInput.classList.add("focus:ring-red-600");
      titleInput.classList.remove("ring-green-600");
      titleInput.classList.add("ring-red-300");
    }
  });

  const imageInput = document.getElementById("image");

  imageInput.addEventListener("input", function () {
    const urlPatternRegex = /^(ftp|http|https):\/\/[^ "]+$/;

    if (urlPatternRegex.test(imageInput.value)) {
      imageInput.classList.remove("focus:ring-red-600");
      imageInput.classList.add("focus:ring-green-600");
      imageInput.classList.remove("ring-red-300");
      imageInput.classList.add("ring-green-600");
    } else {
      imageInput.classList.remove("focus:ring-green-600");
      imageInput.classList.add("focus:ring-red-600");
      imageInput.classList.remove("ring-green-600");
      imageInput.classList.add("ring-red-300");
    }
  });
});
