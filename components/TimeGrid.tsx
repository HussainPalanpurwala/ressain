"use client";

import { useEffect, useRef } from "react";
import styles from "./TimeGrid.module.css";

const SPACING = 42;
const SAMPLE = 16;
const RADIUS = 270;
const STRENGTH = 9;
// Idle lines must read clearly on their own; hover makes them slightly stronger.
const IDLE_ALPHA = 0.5;
const HOVER_ALPHA = 0.75;

export default function TimeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canHover = window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let alpha = IDLE_ALPHA;
    let targetAlpha = IDLE_ALPHA;
    const mouse = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    let frame = 0;
    let visible = false;
    // True while the pointer is over the section. The warp must keep rendering
    // for as long as there is a live hover target, even if the eased mouse
    // position happens to catch up to the pointer for a frame.
    let hovering = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      // Clear inline sizing first so the canvas can follow parent/viewport
      // changes instead of staying locked to its previous measured size.
      canvas.style.width = "";
      canvas.style.height = "";
      const nextWidth = canvas.clientWidth;
      const nextHeight = canvas.clientHeight;
      const nextW = Math.floor(nextWidth * ratio);
      const nextH = Math.floor(nextHeight * ratio);
      if (!nextW || !nextH) return;
      // Track the CSS size every time, even when the backing-store size has
      // not changed, so a first-frame draw always has real dimensions.
      width = nextWidth;
      height = nextHeight;
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      start();
    };

    const onMove = (event: PointerEvent) => {
      if (!canHover) return;
      if (!reduced) {
        const rect = canvas.getBoundingClientRect();
        target.x = event.clientX - rect.left;
        target.y = event.clientY - rect.top;
      }
      targetAlpha = HOVER_ALPHA;
      hovering = true;
      // The loop may have already settled since the last move. Wake it up so
      // the new target is actually eased toward and redrawn.
      start();
    };

    const onLeave = () => {
      targetAlpha = IDLE_ALPHA;
      target.x = -9999;
      target.y = -9999;
      hovering = false;
      // Keep rendering while the warp eases back out to its resting position.
      start();
    };

    const warped = (x: number, y: number) => {
      if (reduced) return { x, y };
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= RADIUS || distance < 0.001) return { x, y };
      const t = 1 - distance / RADIUS;
      // Smoothstep: gentle bends instead of a sharp pinpoint bulge.
      const falloff = t * t * (3 - 2 * t);
      const push = falloff * STRENGTH;
      return {
        x: x + (dx / distance) * push,
        y: y + (dy / distance) * push,
      };
    };

    const drawLine = (vertical: boolean, position: number, color: string) => {
      ctx.beginPath();
      const length = vertical ? height : width;
      for (let i = 0; i <= length; i += SAMPLE) {
        const point = warped(vertical ? position : i, vertical ? i : position);
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    const render = () => {
      frame = 0;
      alpha += (targetAlpha - alpha) * 0.035;
      if (!reduced) {
        mouse.x += (target.x - mouse.x) * 0.12;
        mouse.y += (target.y - mouse.y) * 0.12;
      }
      const converged =
        Math.abs(targetAlpha - alpha) < 0.001 &&
        Math.abs(target.x - mouse.x) < 0.1 &&
        Math.abs(target.y - mouse.y) < 0.1;
      // Stop only when there is no hover target left AND the eased values have
      // caught up. While hovering, keep the loop alive so the warp can follow
      // every pointer move instead of freezing at a half-finished bend.
      // Reduced motion has no warp to follow, so it may settle while hovering.
      const done = converged && (reduced || !hovering);
      if (done) {
        alpha = targetAlpha;
        mouse.x = target.x;
        mouse.y = target.y;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.globalAlpha = alpha;

      for (let x = 0; x <= width; x += SPACING) {
        drawLine(true, x, x % (SPACING * 3) === 0 ? "#f0254b" : "#e453a3");
      }
      for (let y = 0; y <= height; y += SPACING) {
        drawLine(false, y, y % (SPACING * 3) === 0 ? "#f0254b" : "#e453a3");
      }
      ctx.globalAlpha = 1;

      if (visible && !done) frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    // ResizeObserver watches the parent's box, but a viewport change (zoom,
    // orientation, moving to a different-DPI screen) can change the ratio or
    // the canvas' percentage height without resizing that box.
    window.addEventListener("resize", resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    visibilityObserver.observe(parent);
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    // Paint one full frame immediately on mount, regardless of intersection:
    // if the observer never fires (unsupported, hidden parent, section already
    // scrolled into view, etc.) the idle grid is still visible.
    render();
    start();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.grid} aria-hidden="true" />;
}
