import EditorJS from "https://cdn.skypack.dev/@editorjs/editorjs@latest";
import Paragraph from "https://cdn.skypack.dev/@editorjs/paragraph@latest";
import Header from "https://cdn.skypack.dev/@editorjs/header@latest";

const editor = new EditorJS({
  holder: "editor",
  tools: {
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
    },
    header: {
      class: Header,
      config: {
        placeholder: "Enter a header",
        levels: [2, 3, 4],
        defaultLevel: 2,
      },
      inlineToolbar: true,
    },
  },
});
