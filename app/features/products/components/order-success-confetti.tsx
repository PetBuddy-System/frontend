import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

function createParticle(width: number, colors: string[]): Particle {
  return {
    x: Math.random() * width,
    y: -10,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
    speedX: (Math.random() - 0.5) * 2,
    speedY: Math.random() * 3 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 5,
  };
}

export function OrderSuccessConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const canvasElement = canvas;
    const canvasContext = context;

    const rootStyles = getComputedStyle(document.documentElement);
    const colors = [
      rootStyles.getPropertyValue("--color-primary").trim(),
      rootStyles.getPropertyValue("--color-secondary").trim(),
      rootStyles.getPropertyValue("--color-info").trim(),
      rootStyles.getPropertyValue("--color-card").trim(),
    ].filter(Boolean);

    let animationFrame = 0;
    let particles: Particle[] = [];
    const timers: number[] = [];

    function resize() {
      canvasElement.width = window.innerWidth;
      canvasElement.height = window.innerHeight;
    }

    function drawParticle(particle: Particle) {
      canvasContext.save();
      canvasContext.translate(particle.x, particle.y);
      canvasContext.rotate((particle.rotation * Math.PI) / 180);
      canvasContext.fillStyle = particle.color;
      canvasContext.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size,
      );
      canvasContext.restore();
    }

    function animate() {
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
      particles = particles.filter(
        (particle) => particle.y < canvasElement.height,
      );

      particles.forEach((particle) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.rotationSpeed;
        drawParticle(particle);
      });

      animationFrame = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);

    for (let index = 0; index < 80; index += 1) {
      const timer = window.setTimeout(() => {
        particles.push(createParticle(canvasElement.width, colors));
      }, index * 20);
      timers.push(timer);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
      aria-hidden
    />
  );
}
