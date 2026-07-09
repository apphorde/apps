import { ref, watch, defineProp, defineEvent } from "@li3/web";
import useStore, { storeToRefs } from "@app/store.mjs";

export default function () {
  defineProp("applets");

  const onTile = defineEvent("tile");
  const onResetAll = defineEvent("resetall");
  const onShowAll = defineEvent("showall");
  const onClear = defineEvent("clear");
  const { zoom } = storeToRefs(useStore());

  const toolbarCollapsed = ref(
    (localStorage.getItem("toolbarCollapsed") || "") === "true",
  );

  const instructionsCollapsed = ref(
    (localStorage.getItem("helpCollapsed") || "") === "true",
  );

  watch(toolbarCollapsed, (value) =>
    localStorage.setItem("toolbarCollapsed", value),
  );
  watch(instructionsCollapsed, (value) =>
    localStorage.setItem("helpCollapsed", value),
  );

  function toggleToolbar() {
    toolbarCollapsed.value = !toolbarCollapsed.value;
  }

  function toggleInstructions() {
    instructionsCollapsed.value = !instructionsCollapsed.value;
  }

  return {
    zoom,
    toolbarCollapsed,
    instructionsCollapsed,
    toggleInstructions,
    toggleToolbar,
    onTile,
    onResetAll,
    onShowAll,
    onClear,
  };
}
