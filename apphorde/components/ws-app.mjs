import { ref, computed, watch, loadCss } from "@li3/web";
import useStore, { storeToRefs } from "@app/store.mjs";

export default function () {
  const store = useStore();
  const { panX, panY, zoom } = storeToRefs(store);

  const applets = ref(
    JSON.parse(localStorage.getItem("workspace-applets") || "[]")
  );

  const dragOffsetX = ref(0);
  const dragOffsetY = ref(0);
  const resizeEdge = ref("");
  const resizeApplet = ref(null);
  const resize = ref({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    currentX: 0,
    currentY: 0,
  });
  const nextZIndex = computed(() => {
    const list = applets.value;
    if (list.length === 0) return 1;
    return Math.max(...list.map((a) => a.zIndex || 0)) + 1;
  });

  watch(applets, (value) => {
    localStorage.setItem("workspace-applets", JSON.stringify(value));
  });

  function onDraw($event) {
    const { x, y, width, height } = $event.detail;
    const newApplet = {
      id: `applet-${Date.now()}`,
      x,
      y,
      width,
      height,
      zIndex: nextZIndex.value,
    };
    applets.value.push(newApplet);
    bringToFront(newApplet.id);
  }

  function updateApplet(id, updates) {
    applets.value = applets.value.map((x) =>
      x.id === id ? { ...x, ...updates } : x
    );
  }

  function bringToFront(id) {
    updateApplet(id, { zIndex: nextZIndex.value });
  }

  /**
   * @param {object} applet
   * @param {DragEvent} e */
  function onDragStart(applet, e) {
    console.log("dragstart", e, applet);
    e.dataTransfer.setData("text/plain", e.target.id);
    e.target.style.opacity = "0.5"; // Visual feedback

    const pos = store.screenToCanvas(e.clientX, e.clientY);
    dragOffsetX.value = pos.x - applet.x;
    dragOffsetY.value = pos.y - applet.y;

    bringToFront(applet.id);
  }

  /**
   * @param {object} applet
   * @param {DragEvent} e
   */
  function onDragStop(applet, e) {
    console.log("dragstop", e, applet);
    e.target.style.opacity = "";
  }

  /** @param {DragEvent} e */
  function onDrop(e) {
    const id = e.dataTransfer.getData("text");
    const applet = applets.value.find((a) => a.id === id);
    const pos = store.screenToCanvas(e.clientX, e.clientY);

    updateApplet(applet.id, {
      x: pos.x - dragOffsetX.value,
      y: pos.y - dragOffsetY.value,
    });

    console.log(applets.value.find((a) => a.id === id));
  }

  function onResize(applet, position) {
    if (!resizeEdge.value || !resizeApplet.value) {
      return;
    }

    const { x, y } = position;
    const v = resize.value;
    const pos = store.screenToCanvas(x, y);
    const deltaX = pos.x - v.x;
    const deltaY = pos.y - v.y;

    let newX = v.currentX;
    let newY = v.currentY;
    let newWidth = v.width;
    let newHeight = v.height;

    const edge = resizeEdge.value;

    if (edge.includes("e")) {
      newWidth = Math.max(100, v.x + deltaX);
    }
    if (edge.includes("w")) {
      const widthChange = Math.min(deltaX, v.width - 100);
      newX = v.currentX + widthChange;
      newWidth = v.width - widthChange;
    }
    if (edge.includes("s")) {
      newHeight = Math.max(100, v.height + deltaY);
    }
    if (edge.includes("n")) {
      const heightChange = Math.min(deltaY, v.height - 100);
      newY = v.y + heightChange;
      newHeight = v.height - heightChange;
    }

    updateApplet(applet.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  }

  function onResizeStart(applet, e) {
    const pos = store.screenToCanvas(e.clientX, e.clientY);
    resizeEdge.value = e.edge;
    resizeApplet.value = applet;
    resize.value = {
      x: pos.x,
      y: pos.y,
      width: applet.width,
      height: applet.height,
      currentX: applet.x,
      currentY: applet.y,
    };
    bringToFront(applet.id);
  }

  function onResizeStop() {
    resizeEdge.value = "";
    resizeApplet.value = null;
  }

  function onSelect(applet, app) {
    updateApplet(applet.id, { app });
  }

  function onDelete(applet) {
    applets.value = applets.value.filter((a) => a.id !== applet.id);
  }

  function showAllApplets() {
    const list = applets.value;

    if (list.length === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    list.forEach((applet) => {
      minX = Math.min(minX, applet.x);
      minY = Math.min(minY, applet.y);
      maxX = Math.max(maxX, applet.x + applet.width);
      maxY = Math.max(maxY, applet.y + applet.height);
    });

    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const boundingWidth = maxX - minX;
    const boundingHeight = maxY - minY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const zoomX = viewportWidth / boundingWidth;
    const zoomY = viewportHeight / boundingHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.1), 5);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    zoom.value = newZoom;
    panX.value = viewportWidth / 2 - centerX * newZoom;
    panY.value = viewportHeight / 2 - centerY * newZoom;
  }

  function tileApplets() {
    const list = applets.value;
    if (list.length === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 10;
    const tileWidth = (viewportWidth - gap * 3) / 2;
    const tileHeight = (viewportHeight - gap * 3) / 2;

    zoom.value = 1;
    panX.value = 0;
    panY.value = 0;

    applets.value = list.map((applet, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      return {
        ...applet,
        x: gap + col * (tileWidth + gap),
        y: gap + row * (tileHeight + gap),
        width: tileWidth,
        height: tileHeight,
      };
    });
  }

  function clearAll() {
    if (window.confirm("Are you sure you want to clear all applets?")) {
      applets.value = [];
    }
  }

  function onResetView() {
    store.resetView();
  }

  const items = ref(Array.from({ length: 10 }, (_, i) => ({ text: i + 1 })));

  return {
    showAllApplets,
    tileApplets,
    clearAll,
    onDragStart,
    onDragStop,
    onDrop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDelete,
    onSelect,
    onResetView,
    onDraw,
    bringToFront,
    applets,
    items,

    zoom,
  };
}
