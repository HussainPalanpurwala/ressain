"use client";

import { useEffect, useRef } from "react";
import styles from "./TimeGrid.module.css";

const SPACING = 42;
const SAMPLE = 16;
const RADIUS = 270;
const STRENGTH = 9;

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
    let alpha = 0.3;
    let targetAlpha = 0.3;
    const mouse = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    let frame = 0;
    let visible = false;

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
      if (canvas.width === nextW && canvas.height === nextH) return;
      width = nextWidth;
      height = nextHeight;
      canvas.width = nextW;
      canvas.height = nextH;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      start();
    };

    const onMove = (event: PointerEvent) => {
      if (!canHover) return;
      const rect = canvas.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      targetAlpha = 0.55;
    };

    const onLeave = () => {
      targetAlpha = 0.3;
      target.x = -9999;
      target.y = -9999;
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
      const settled =
        Math.abs(targetAlpha - alpha) < 0.001 &&
        Math.abs(target.x - mouse.x) < 0.1 &&
        Math.abs(target.y - mouse.y) < 0.1;
      if (settled) {
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

      if (!settled && visible) frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(render);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
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
    start();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibilityObserver.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.grid} aria-hidden="true" />;
}
