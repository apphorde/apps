import { ref, computed, defineProp, defineEvent, watch } from "@li3/web";
import createChecklist from "https://aifn.run/fn/12c5cd32-9c33-4a4b-8a18-787a27df8109.js";
import enhanceTextNote from "https://aifn.run/fn/1256f730-a632-49f0-87a0-a0f523be9edc.js";

export default function noteCard() {
  const noteHTML = ref("");
  const generating = ref(false);
  const emitDelete = defineEvent("delete");
  const emitModify = defineEvent("modify");
  const onToggle = defineEvent("toggle");
  const noteProp = defineProp("note");
  const note = ref({});

  watch(noteProp, v => note.value = v);

  function debounce(fn, delay = 500) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  const textHeight = computed(
    () => (note.value?.content?.split("\n").length || 1) + 1,
  );

  const onNoteHtmlChange = debounce(($event) => {
    note.value.html = $event.target.innerHTML;
  });

  function onDeleteNote() {
    emitDelete(note);
  }

  function onUseHtml() {
    note.value.type = "html";

    if (!noteHTML.value) {
      noteHTML.value = note.value.html || "";
    }
  }

  function onUseText() {
    note.value.type = "text";
  }

  function onUseCheckList() {
    note.value.type = "tasks";
    note.value.tasks ||= [];
  }

  async function onNoteAutomagic() {
    generating.value = true;
    const type = note.value.type;

    if (type === "tasks") {
      await generateChecList();
    }

    if (type === "text") {
      await updateText();
    }

    generating.value = false;
  }

  async function updateText() {
    const title = note.value.title;
    const text = note.value.content;
    note.value.content = await enhanceTextNote({ title, text });
  }

  function onSetTitle(value) {
    note.value.title = value;
    emitModify(note.value);
  }

  function onSetContent(value) {
    note.value.content = value;
    emitModify(note.value);
  }

  async function generateChecList() {
    const task = note.value.title;
    const context = note.value.tasks?.map((n) => n.task).join("\n");

    const response = await createChecklist({
      task,
      context: context ? "Previous tasks in the list:\n" + context : "",
    });

    const list = tryParse(response);

    if (Array.isArray(list)) {
      note.value.tasks = list.map((task) => ({ completed: false, task }));
    }
  }

  function onTaskKeyUp(event, task) {
    const target = event.target;

    if (event.code === "Backspace" && target.value === "") {
      (target.parentNode?.previousSibling?.childNodes[1]).focus();
      note.value.tasks = note.value.tasks?.filter((t) => t !== task);
    }

    if (event.code === "Enter") {
      const index = Number(note.value.tasks?.indexOf(task) || 0) + 1;

      note.value.tasks = note.value.tasks
        ?.slice(0, index)
        .concat({ completed: false, task: "" })
        .concat(note.value.tasks.slice(index));
    }
  }

  function onAddTask() {
    note.value.tasks?.push({ completed: false, task: "" });
  }

  function tryParse(input) {
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }

  return {
    generating,
    textHeight,
    onAddTask,
    onSetTitle,
    onSetContent,
    onDeleteNote,
    onNoteHtmlChange,
    onUseCheckList,
    onUseHtml,
    onUseText,
    onNoteAutomagic,
    onTaskKeyUp,
    onToggle,
  };
}
