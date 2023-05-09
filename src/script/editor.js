document.addEventListener("DOMContentLoaded", async () => {
  const contentInput = document.getElementById("article-content");
  const content = contentInput.value;
  const editor = new EditorJS({
    autofocus: true,
    holder: "editor",

    tools: {
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      header: {
        class: Header,
        inlineToolbar: ["bold", "italic"],
        config: {
          placeholder: "Entrer un titre",
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        shortcut: "CMD+SHIFT+O",
        config: {
          quotePlaceholder: "Entrer une citation",
          captionPlaceholder: "Entrer l'auteur de la citation",
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: "unordered",
        },
      },
    },
    onReady: async () => {
      if (content !== "") {
        await editor.blocks.renderFromHTML(content);
      }
    },
  });
  const edjsParser = edjsHTML();
  const form = document.getElementById("form");
  const editorContainer = document.getElementById("editor");

  const saveBtn = document.getElementById("save-editor");
  saveBtn.addEventListener("click", (event) => {
    event.preventDefault();
    editor.save().then((outputData) => {
      let html = edjsParser.parse(outputData).join("\n");
      contentInput.value = html;

      form.submit();
    });
  });
});

/*function convertDataToHtml(blocks) {
  var convertedHtml = "";
  blocks.map((block) => {
    switch (block.type) {
      case "header":
        convertedHtml += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        break;
      case "embded":
        convertedHtml += `<div><iframe width="560" height="315" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
        break;
      case "paragraph":
        convertedHtml += `<p>${block.data.text}</p>`;
        break;
      case "delimiter":
        convertedHtml += "<hr />";
        break;
      case "image":
        convertedHtml += `<img class="img-fluid" src="${block.data.file.url}" title="${block.data.caption}" /><br /><em>${block.data.caption}</em>`;
        break;
      case "list":
        convertedHtml += "<ul>";
        block.data.items.forEach(function (li) {
          convertedHtml += `<li>${li}</li>`;
        });
        convertedHtml += "</ul>";
        break;
      default:
        console.log("Unknown block type", block.type);
        break;
    }
  });
  return convertedHtml;
}*/
