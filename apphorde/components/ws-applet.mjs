import { defineProp, defineEvent, loadCss } from "@li3/web";

const APPLETS = [
  {
    id: "calculator",
    name: "Calculator",
    icon: "🧮",
    url: "https://www.calculator.net/",
  },
  {
    id: "notes",
    name: "Notes",
    icon: "📝",
    url: "https://notes.apphor.de",
  },
  {
    id: "maps",
    name: "Maps",
    icon: "🗺️",
    url: "https://www.openstreetmap.org/export/embed.html",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    icon: "📚",
    url: "https://en.wikipedia.org/wiki/Main_Page",
  },
  {
    id: "translator",
    name: "Translator",
    icon: "🌐",
    url: "https://translate.google.com/",
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    icon: "🍅",
    url: "https://pomodoro.apphor.de",
  },
];

const edges = [
  {
    cls: "absolute top-0 left-2 right-2 h-1 cursor-n-resize hover:bg-blue-500/50",
    edge: "n",
  },
  {
    cls: "absolute bottom-0 left-2 right-2 h-1 cursor-s-resize hover:bg-blue-500/50",
    edge: "s",
  },
  {
    cls: "absolute left-0 top-2 bottom-2 w-1 cursor-w-resize hover:bg-blue-500/50",
    edge: "w",
  },
  {
    cls: "absolute right-0 top-2 bottom-2 w-1 cursor-e-resize hover:bg-blue-500/50",
    edge: "e",
  },
  {
    cls: "absolute top-0 left-0 w-2 h-2 cursor-nw-resize hover:bg-blue-500/50",
    edge: "nw",
  },
  {
    cls: "absolute top-0 right-0 w-2 h-2 cursor-ne-resize hover:bg-blue-500/50",
    edge: "ne",
  },
  {
    cls: "absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize hover:bg-blue-500/50",
    edge: "sw",
  },
  {
    cls: "absolute bottom-0 right-0 w-2 h-2 cursor-se-resize hover:bg-blue-500/50",
    edge: "se",
  },
];

export default function () {
  const applet = defineProp("applet");
  const title = defineProp("title");
  const onResizeStart = defineEvent("resizestart");
  const onResizeStop = defineEvent("resizestop");
  const onFocus = defineEvent("focus");
  const onDelete = defineEvent("delete");
  const onSelect = defineEvent("select");

  return {
    edges,
    APPLETS,
    onResizeStart,
    onResizeStop,
    onDelete,
    onSelect,
    onFocus,
  };
}
