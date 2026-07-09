import { templateRef, ref, computed, defineEvent } from "@li3/web";
import useStore, { storeToRefs } from "@app/store.mjs";

export default function () {
  const canvas = templateRef("canvas");
  const store = useStore();
  const { panX, panY, zoom } = storeToRefs(store);
  const onMove = defineEvent("move");
  const onDraw = defineEvent("draw");
  const zoomSize = computed(() => zoom.value * 20);
  const isDrawing = ref(false);
  const drawStartX = ref(0);
  const drawStartY = ref(0);
  const drawCurrentX = ref(0);
  const drawCurrentY = ref(0);
  const isPanning = ref(false);
  const panStartX = ref(0);
  const panStartY = ref(0);
  const drawPreviewCoords = computed(() => {
    const x = Math.min(drawStartX.value, drawCurrentX.value);
    const y = Math.min(drawStartY.value, drawCurrentY.value);
    const width = Math.abs(drawCurrentX.value - drawStartX.value);
    const height = Math.abs(drawCurrentY.value - drawStartY.value);

    return { x, y, width, height };
  });

  function onPointerDown(e) {
    if (!e.target.classList.contains("canvas")) return;

    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      isPanning.value = true;
      panStartX.value = e.clientX - panX.value;
      panStartY.value = e.clientY - panY.value;
      return;
    }

    if (e.button === 0) {
      const pos = store.screenToCanvas(e.clientX, e.clientY);
      isDrawing.value = true;
      drawStartX.value = pos.x;
      drawStartY.value = pos.y;
      drawCurrentX.value = pos.x;
      drawCurrentY.value = pos.y;
      return;
    }
  }

  function onPointerMove(e) {
    if (isPanning.value) {
      panX.value = e.clientX - panStartX.value;
      panY.value = e.clientY - panStartY.value;
      return;
    }

    if (isDrawing.value) {
      const pos = store.screenToCanvas(e.clientX, e.clientY);
      drawCurrentX.value = pos.x;
      drawCurrentY.value = pos.y;
      return;
    }

    onMove({ x: e.clientX, y: e.clientY });
  }

  function onPointerUp() {
    if (isDrawing.value) {
      const width = Math.abs(drawCurrentX.value - drawStartX.value);
      const height = Math.abs(drawCurrentY.value - drawStartY.value);

      if (width >= 100 && height >= 100) {
        onDraw({
          x: Math.min(drawStartX.value, drawCurrentX.value),
          y: Math.min(drawStartY.value, drawCurrentY.value),
          width,
          height,
        });
      }
    }

    isDrawing.value = false;
    isPanning.value = false;
  }

  function onWheel(e) {
    const delta = e.deltaY > 0 ? -0.01 : 0.01;
    const prevZoom = zoom.value;
    const newZoom = Math.min(Math.max(prevZoom + delta, 0.1), 5);
    const rect = canvas.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const newPanX = mouseX - ((mouseX - panX.value) / prevZoom) * newZoom;
    const newPanY = mouseY - ((mouseY - panY.value) / prevZoom) * newZoom;

    store.updateCanvas(newPanX, newPanY, newZoom);
  }

  return {
    zoom,
    zoomSize,
    panX,
    panY,
    isDrawing,
    drawStartX,
    drawStartY,
    drawCurrentX,
    drawCurrentY,
    isPanning,
    panStartX,
    panStartY,
    drawPreviewCoords,

    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  };
}
