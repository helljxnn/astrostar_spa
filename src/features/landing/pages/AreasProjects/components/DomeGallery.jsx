import { useEffect, useMemo, useRef, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import "./DomeGallery.css";

const DEFAULT_IMAGES = [
  {
    src: "/assets/images/services_image.jpg",
    alt: "Entrenamiento fundación",
  },
  {
    src: "/assets/images/Foundation/founder.jpg",
    alt: "Fundadora",
  },
  {
    src: "/assets/images/Foundation/career.jpg",
    alt: "Trayectoria",
  },
  {
    src: "/assets/images/Foundation/fmv_clip.png",
    alt: "Video fundación",
  },
  {
    src: "/assets/images/CategoriasHero.jpg",
    alt: "Categorías",
  },
  {
    src: "/assets/images/EventsHero.png",
    alt: "Eventos",
  },
  {
    src: "/assets/images/AboutHero.png",
    alt: "Momento social",
  },
  {
    src: "/assets/images/Foundation/banner_foundation.jpg",
    alt: "Banner fundación",
  },
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 280,
  segments: 34,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeAngle = (deg) => ((deg % 360) + 360) % 360;
const wrapAngleSigned = (deg) => {
  const angle = (((deg + 180) % 360) + 360) % 360;
  return angle - 180;
};

const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const number = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(number) ? number : fallback;
};

function buildItems(pool, segments) {
  const xCols = Array.from({ length: segments }, (_, index) => -37 + index * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, column) => {
    const ys = column % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  if (pool.length === 0) {
    return coords.map((coord) => ({ ...coord, src: "", alt: "" }));
  }

  const normalizedImages = pool.map((image) =>
    typeof image === "string"
      ? { src: image, alt: "" }
      : { src: image.src || "", alt: image.alt || "" },
  );

  const usedImages = Array.from(
    { length: coords.length },
    (_, index) => normalizedImages[index % normalizedImages.length],
  );

  for (let index = 1; index < usedImages.length; index += 1) {
    if (usedImages[index].src === usedImages[index - 1].src) {
      for (let cursor = index + 1; cursor < usedImages.length; cursor += 1) {
        if (usedImages[cursor].src !== usedImages[index].src) {
          const tmp = usedImages[index];
          usedImages[index] = usedImages[cursor];
          usedImages[cursor] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((coord, index) => ({
    ...coord,
    src: usedImages[index].src,
    alt: usedImages[index].alt,
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.78,
  fitBasis = "auto",
  minRadius = 560,
  maxRadius = Infinity,
  padFactor = 0.22,
  overlayBlurColor = "#140b2d",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "260px",
  openedImageHeight = "360px",
  imageBorderRadius = "22px",
  openedImageBorderRadius = "26px",
  grayscale = false,
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const minDim = Math.min(width, height);
      const maxDim = Math.max(width, height);
      const aspect = width / height;

      let basis = minDim;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = width;
          break;
        case "height":
          basis = height;
          break;
        default:
          basis = aspect >= 1.3 ? width : minDim;
      }

      let radius = basis * fit;
      radius = Math.min(radius, height * 1.35);
      radius = clamp(radius, minRadius, maxRadius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${Math.round(radius)}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, [
    fit,
    fitBasis,
    grayscale,
    imageBorderRadius,
    maxRadius,
    minRadius,
    openedImageBorderRadius,
    overlayBlurColor,
    padFactor,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const maxV = 1.4;
      let velocityX = clamp(vx, -maxV, maxV) * 80;
      let velocityY = clamp(vy, -maxV, maxV) * 80;
      let frames = 0;
      const damp = clamp(dragDampening ?? 0.6, 0, 1);
      const friction = 0.94 + 0.055 * damp;
      const stopThreshold = 0.015 - 0.01 * damp;
      const maxFrames = Math.round(90 + 270 * damp);

      const step = () => {
        velocityX *= friction;
        velocityY *= friction;

        if (
          (Math.abs(velocityX) < stopThreshold && Math.abs(velocityY) < stopThreshold) ||
          frames > maxFrames
        ) {
          inertiaRAF.current = null;
          return;
        }

        frames += 1;
        const nextX = clamp(
          rotationRef.current.x - velocityY / 200,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = wrapAngleSigned(rotationRef.current.y + velocityX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };

      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        const evt = event;
        draggingRef.current = true;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) {
          movedRef.current = true;
        }

        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          let [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let velocityX = vMagX * dirX;
          let velocityY = vMagY * dirY;

          if (
            Math.abs(velocityX) < 0.001 &&
            Math.abs(velocityY) < 0.001 &&
            Array.isArray(movement)
          ) {
            const [mx, my] = movement;
            velocityX = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
            velocityY = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
          }

          if (Math.abs(velocityX) > 0.005 || Math.abs(velocityY) > 0.005) {
            startInertia(velocityX, velocityY);
          }
          if (movedRef.current) {
            lastDragEndAt.current = performance.now();
          }
          movedRef.current = false;
        }
      },
    },
    { target: mainRef, eventOptions: { passive: true } },
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return undefined;

    const close = () => {
      if (performance.now() - openStartedAtRef.current < 220) return;
      const focused = focusedElRef.current;
      if (!focused) return;

      const parent = focused.parentElement;
      const overlay = viewerRef.current?.querySelector(".enlarge");
      if (!overlay) return;

      const reference = parent.querySelector(".item__image--reference");
      const originalPosition = originalTilePositionRef.current;
      if (!originalPosition) {
        overlay.remove();
        if (reference) reference.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        focused.style.visibility = "";
        focused.style.zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        unlockScroll();
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const targetPosition = {
        left: originalPosition.left - rootRect.left,
        top: originalPosition.top - rootRect.top,
        width: originalPosition.width,
        height: originalPosition.height,
      };

      const currentPosition = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height,
      };

      const closingOverlay = document.createElement("div");
      closingOverlay.className = "enlarge-closing";
      closingOverlay.style.cssText = `position:absolute;left:${currentPosition.left}px;top:${currentPosition.top}px;width:${currentPosition.width}px;height:${currentPosition.height}px;z-index:9999;border-radius: var(--enlarge-radius, 26px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${enlargeTransitionMs}ms ease-out;pointer-events:none;`;

      const image = overlay.querySelector("img");
      if (image) {
        const imageClone = image.cloneNode();
        imageClone.style.cssText = "width:100%;height:100%;object-fit:cover;";
        closingOverlay.appendChild(imageClone);
      }

      overlay.remove();
      rootRef.current.appendChild(closingOverlay);
      void closingOverlay.getBoundingClientRect();
      requestAnimationFrame(() => {
        closingOverlay.style.left = `${targetPosition.left}px`;
        closingOverlay.style.top = `${targetPosition.top}px`;
        closingOverlay.style.width = `${targetPosition.width}px`;
        closingOverlay.style.height = `${targetPosition.height}px`;
        closingOverlay.style.opacity = "0";
      });

      const clean = () => {
        closingOverlay.remove();
        originalTilePositionRef.current = null;
        if (reference) reference.remove();
        parent.style.transition = "none";
        focused.style.transition = "none";
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");

        requestAnimationFrame(() => {
          focused.style.visibility = "";
          focused.style.opacity = "0";
          focused.style.zIndex = 0;
          focusedElRef.current = null;
          rootRef.current?.removeAttribute("data-enlarging");
          requestAnimationFrame(() => {
            parent.style.transition = "";
            focused.style.transition = "opacity 300ms ease-out";
            requestAnimationFrame(() => {
              focused.style.opacity = "1";
              setTimeout(() => {
                focused.style.transition = "";
                focused.style.opacity = "";
                openingRef.current = false;
                if (
                  !draggingRef.current &&
                  rootRef.current?.getAttribute("data-enlarging") !== "true"
                ) {
                  document.body.classList.remove("dg-scroll-lock");
                }
              }, 300);
            });
          });
        });
      };

      closingOverlay.addEventListener("transitionend", clean, { once: true });
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    scrim.addEventListener("click", close);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  const openItemFromElement = useCallback(
    (el) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();

      const parent = el.parentElement;
      focusedElRef.current = el;
      el.setAttribute("data-focused", "true");
      const offsetX = getDataNumber(parent, "offsetX", 0);
      const offsetY = getDataNumber(parent, "offsetY", 0);
      const sizeX = getDataNumber(parent, "sizeX", 2);
      const sizeY = getDataNumber(parent, "sizeY", 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);

      let rotateY = -(parentY + globalY) % 360;
      if (rotateY < -180) rotateY += 360;
      const rotateX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty("--rot-y-delta", `${rotateY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotateX}deg`);

      const reference = document.createElement("div");
      reference.className = "item__image item__image--reference";
      reference.style.opacity = "0";
      reference.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(reference);
      void reference.offsetHeight;

      const tileRect = reference.getBoundingClientRect();
      const mainRect = mainRef.current?.getBoundingClientRect();
      const frameRect = frameRef.current?.getBoundingClientRect();
      if (!mainRect || !frameRect || tileRect.width <= 0 || tileRect.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(reference);
        unlockScroll();
        return;
      }

      originalTilePositionRef.current = {
        left: tileRect.left,
        top: tileRect.top,
        width: tileRect.width,
        height: tileRect.height,
      };

      el.style.visibility = "hidden";
      el.style.zIndex = 0;

      const overlay = document.createElement("div");
      overlay.className = "enlarge";
      overlay.style.position = "absolute";
      overlay.style.left = `${frameRect.left - mainRect.left}px`;
      overlay.style.top = `${frameRect.top - mainRect.top}px`;
      overlay.style.width = `${frameRect.width}px`;
      overlay.style.height = `${frameRect.height}px`;
      overlay.style.opacity = "0";
      overlay.style.zIndex = "30";
      overlay.style.willChange = "transform, opacity";
      overlay.style.transformOrigin = "top left";
      overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;

      const src = parent.dataset.src || el.querySelector("img")?.src || "";
      const image = document.createElement("img");
      image.src = src;
      overlay.appendChild(image);
      viewerRef.current.appendChild(overlay);

      const translateX = tileRect.left - frameRect.left;
      const translateY = tileRect.top - frameRect.top;
      const scaleX = tileRect.width / frameRect.width;
      const scaleY = tileRect.height / frameRect.height;
      const safeScaleX = Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
      const safeScaleY = Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1;
      overlay.style.transform = `translate(${translateX}px, ${translateY}px) scale(${safeScaleX}, ${safeScaleY})`;

      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        rootRef.current?.setAttribute("data-enlarging", "true");
      }, 16);

      if (openedImageWidth || openedImageHeight) {
        const onFirstTransitionEnd = (event) => {
          if (event.propertyName !== "transform") return;
          overlay.removeEventListener("transitionend", onFirstTransitionEnd);
          const previousTransition = overlay.style.transition;
          overlay.style.transition = "none";
          const targetWidth = openedImageWidth || `${frameRect.width}px`;
          const targetHeight = openedImageHeight || `${frameRect.height}px`;
          overlay.style.width = targetWidth;
          overlay.style.height = targetHeight;
          const newRect = overlay.getBoundingClientRect();
          overlay.style.width = `${frameRect.width}px`;
          overlay.style.height = `${frameRect.height}px`;
          void overlay.offsetWidth;

          overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease`;
          const centeredLeft =
            frameRect.left - mainRect.left + (frameRect.width - newRect.width) / 2;
          const centeredTop =
            frameRect.top - mainRect.top + (frameRect.height - newRect.height) / 2;
          requestAnimationFrame(() => {
            overlay.style.left = `${centeredLeft}px`;
            overlay.style.top = `${centeredTop}px`;
            overlay.style.width = targetWidth;
            overlay.style.height = targetHeight;
          });

          const cleanSecond = () => {
            overlay.removeEventListener("transitionend", cleanSecond);
            overlay.style.transition = previousTransition;
          };

          overlay.addEventListener("transitionend", cleanSecond, { once: true });
        };

        overlay.addEventListener("transitionend", onFirstTransitionEnd);
      }
    },
    [
      enlargeTransitionMs,
      lockScroll,
      openedImageHeight,
      openedImageWidth,
      segments,
      unlockScroll,
    ],
  );

  const onTileClick = useCallback(
    (event) => {
      if (draggingRef.current || movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(event.currentTarget);
    },
    [openItemFromElement],
  );

  const onTilePointerUp = useCallback(
    (event) => {
      if (event.pointerType !== "touch") return;
      if (draggingRef.current || movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(event.currentTarget);
    },
    [openItemFromElement],
  );

  useEffect(() => {
    return () => {
      document.body.classList.remove("dg-scroll-lock");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={{
        "--segments-x": segments,
        "--segments-y": segments,
        "--overlay-blur-color": overlayBlurColor,
        "--tile-radius": imageBorderRadius,
        "--enlarge-radius": openedImageBorderRadius,
        "--image-filter": grayscale ? "grayscale(1)" : "none",
      }}
    >
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((item, index) => (
              <div
                key={`${item.x},${item.y},${index}`}
                className="item"
                data-src={item.src}
                data-offset-x={item.x}
                data-offset-y={item.y}
                data-size-x={item.sizeX}
                data-size-y={item.sizeY}
                style={{
                  "--offset-x": item.x,
                  "--offset-y": item.y,
                  "--item-size-x": item.sizeX,
                  "--item-size-y": item.sizeY,
                }}
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={0}
                  aria-label={item.alt || "Abrir imagen"}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                >
                  <img src={item.src} draggable={false} alt={item.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
