import { onInit, ref, load, unwrap } from "@li3/web";
import {
  getProperty,
  setProperty,
  getProfile,
  signIn,
} from "https://auth.api.apphor.de/index.mjs";
import { Store } from "https://jsonstore.api.apphor.de/index.mjs";

const storeIdKey = "notes:storeId";

function useStore() {
  const store = ref(null);
  const ready = new Promise((resolve) => {
    onInit(async function () {
      let storeId = await getProperty(storeIdKey);

      if (!storeId) {
        storeId = await Store.create();
        await setProperty(storeIdKey, storeId);
      }

      store.value = Store.get(storeId);
      resolve(null);
    });
  });

  return { ready, store };
}

let notesBackend;

export default function app() {
  const { ready, store } = useStore();
  const notes = ref([]);
  const profile = ref(null);
  const loading = ref(true);

  function onDelete(note) {
    if (confirm("Are you sure?")) {
      notes.value = notes.value.filter((n) => n !== note);
      notesBackend.remove(note.uid);
    }
  }

  function onToggle(note) {
    note.collapse = !note.collapse;
    onModify(note);
  }

  async function onModify(note) {
    if (!note.uid) return;
    notes.value = notes.value.map((x) => (x.uid === note.uid ? note : x));
    await notesBackend.set(note.uid, note);
  }

  function onAdd() {
    const newNote = {
      uid: crypto.randomUUID(),
      title: "",
      content: "",
      collapse: true,
      type: "text",
    };

    notes.value = notes.value.concat(newNote);
    notesBackend.set(newNote.uid, newNote);
  }

  onInit(async function () {
    profile.value = await getProfile();
    await ready;

    notesBackend = store.value.getResource("notes");
    notes.value = await notesBackend.list();
    loading.value = false;
  });

  return { profile, notes, onAdd, onDelete, onModify, onToggle, signIn, loading };
}
