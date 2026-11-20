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
// The bend ramps in/out in place instead of a warp point flying off-screen,
// which is what made entering and leaving the area feel abrupt.
const WARP_EASE = 0.08;
const MOUSE_EASE = 0.16;

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
    let warp = 0;
    let targetWarp = 0;
    let hasPointer = false;
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let frame = 0;
    let visible = false;
    // True while the pointer is over the section. The loop stays alive so the
    // bend can follow every move and ease out fully after the pointer leaves.
    let hovering = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = "";
      canvas.style.height = "";
      const nextWidth = canvas.clientWidth;
      const nextHeight = canvas.clientHeight;
      const nextW = Math.floor(nextWidth * ratio);
      const nextH = Math.floor(nextHeight * ratio);
      if (!nextW || !nextH) return;
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
        // On the very first move, place the (invisible) warp point at the
        // pointer so the bend grows in place rather than travelling in.
        if (!hasPointer) {
          mouse.x = target.x;
          mouse.y = target.y;
          hasPointer = true;
        }
      }
      targetWarp = reduced ? 0 : 1;
      targetAlpha = HOVER_ALPHA;
      hovering = true;
      start();
    };

    const onLeave = () => {
      targetAlpha = IDLE_ALPHA;
      // Fade the bend out where it is; keep the last pointer position.
      targetWarp = 0;
      hovering = false;
      start();
    };

    const warped = (x: number, y: number) => {
      if (reduced || warp <= 0.001) return { x, y };
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= RADIUS || distance < 0.001) return { x, y };
      const t = 1 - distance / RADIUS;
      // Smootherstep: an even gentler edge than smoothstep, so the bend has no
      // visible boundary where it starts or stops.
      const falloff = t * t * t * (t * (t * 6 - 15) + 10);
      const push = falloff * STRENGTH * warp;
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
      alpha += (targetAlpha - alpha) * 0.05;
      warp += (targetWarp - warp) * WARP_EASE;
      if (!reduced) {
        mouse.x += (target.x - mouse.x) * MOUSE_EASE;
        mouse.y += (target.y - mouse.y) * MOUSE_EASE;
      }
      const converged =
        Math.abs(targetAlpha - alpha) < 0.001 &&
        Math.abs(targetWarp - warp) < 0.001 &&
        Math.abs(target.x - mouse.x) < 0.1 &&
        Math.abs(target.y - mouse.y) < 0.1;
      // Stop only when there is no hover target left and everything has eased
      // back to rest. While hovering the loop stays alive for every move.
      const done = converged && (reduced || !hovering);
      if (done) {
        alpha = targetAlpha;
        warp = targetWarp;
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
    // Paint one full frame immediately on mount so the idle grid is visible
    // even if the observer never fires.
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
