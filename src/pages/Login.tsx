import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "@/Context/AuthContext";

const LoginPage = () => {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      alert("Logged in successfully ✅");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  // Canvas animation with light sky blue dots and lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const dotsCount = 100;
    const dots: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

    for (let i = 0; i < dotsCount; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 2 + Math.random() * 2,
      });
    }

    let mouseX: number | null = null;
    let mouseY: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      dots.forEach((dot, idx) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > height) dot.vy *= -1;

        // Draw dot - sky blue color
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#7dd3fc"; // sky blue 400
        ctx.fill();

        // Connect close dots with lighter sky blue lines
        for (let j = idx + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(dot.x - d2.x, dot.y - d2.y);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(125, 211, 252, ${1 - dist / 120})`; // rgba sky blue with fade
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.stroke();
          }
        }

        // Connect dots to mouse if close
        if (mouseX !== null && mouseY !== null) {
          const distMouse = Math.hypot(dot.x - mouseX, dot.y - mouseY);
          if (distMouse < 150) {
            ctx.strokeStyle = `rgba(125, 211, 252, ${1 - distMouse / 150})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            dot.vx += (mouseX - dot.x) * 0.0005;
            dot.vy += (mouseY - dot.y) * 0.0005;
          }
        }
      });

      requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0c1826] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />

      <div className="relative z-10 max-w-md w-full p-10 bg-gradient-to-tr from-[#1e3a8a]/80 to-[#60a5fa]/60 rounded-3xl shadow-lg backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png" // عدل حسب مكان اللوجو عندك
            alt="Doctor Assistant Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          />

          {error && (
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sky-300">
          New here?{" "}
          <a href="/register" className="underline hover:text-sky-100 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
