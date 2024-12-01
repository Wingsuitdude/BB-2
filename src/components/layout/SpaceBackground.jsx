import React, { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const stars = [];
    const STAR_COUNT = 800;
    const STAR_SPEED = 2; // Increased speed
    const MAX_DEPTH = 1000;

    // Initialize stars
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * MAX_DEPTH,
        size: Math.random() * 2,
        color: `rgba(${64 + Math.random() * 191}, ${149 + Math.random() * 106}, ${255}, 1)`
      });
    }

    function animate() {
      // Clear canvas with less trail effect
      ctx.fillStyle = 'rgba(17, 18, 21, 0.3)'; // Increased opacity for less trailing
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate center of screen
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Update and draw stars
      stars.forEach(star => {
        // Move star closer
        star.z -= STAR_SPEED;

        // Reset star to back if it passes screen
        if (star.z <= 0) {
          star.z = MAX_DEPTH;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        // Project star position onto screen
        const k = 128.0 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        // Draw star if it's on screen
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / MAX_DEPTH) * 2.5;
          const brightness = 1 - star.z / MAX_DEPTH;

          // Draw star core
          ctx.beginPath();
          ctx.fillStyle = star.color.replace('1)', `${brightness})`);
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();

          // Add minimal glow effect
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 1.5);
          gradient.addColorStop(0, star.color.replace('1)', `${brightness * 0.3})`));
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        backgroundColor: '#111215',
      }}
    />
  );
}