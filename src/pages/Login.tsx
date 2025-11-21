import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "@/Context/AuthContext";

const LoginPage = () => {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ email_or_phone: "", password: "" });
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  try {
    const credentials = {
      email_or_phone: form.email_or_phone,
      password: form.password // ⚠️ هنا كمان
    };
    
    await login(credentials);
    alert("Logged in successfully ✅");
  } catch (err) {
    setError("Login failed. Please check your credentials.");
  }
};
  // Canvas animation with new blue dots and lines
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

        // Draw dot - new blue color
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#039fb3"; // New blue color
        ctx.fill();

        // Connect close dots with lighter blue lines
        for (let j = idx + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(dot.x - d2.x, dot.y - d2.y);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(3, 159, 179, ${1 - dist / 120})`; // rgba new blue with fade
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
            ctx.strokeStyle = `rgba(3, 159, 179, ${1 - distMouse / 150})`;
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

      <div className="relative z-10 max-w-md w-full p-10 bg-gradient-to-tr from-[#039fb3]/80 to-[#039fb3]/60 rounded-3xl shadow-lg backdrop-blur-md border border-white/20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logs.png"
            alt="Biz Hub Studio Logo"
            className="w-30 h-30 object-contain"
          />
        </div>

        {/* Login Type Tabs */}
        <div className="flex mb-6 bg-white/20 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setLoginType("email")}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginType === "email" 
                ? "bg-white text-[#039fb3]" 
                : "text-white hover:bg-white/10"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginType("phone")}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginType === "phone" 
                ? "bg-white text-[#039fb3]" 
                : "text-white hover:bg-white/10"
            }`}
          >
            Mobile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type={loginType === "email" ? "email" : "tel"}
            name="email_or_phone"
            placeholder={loginType === "email" ? "Email Address" : "Phone Number"}
            required
            value={form.email_or_phone}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-4 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition"
          />

          {error && (
            <p className="text-red-300 text-sm font-semibold text-center bg-red-500/20 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-[#039fb3] font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-white">
          New here?{" "}
          <a 
            href="/register" 
            className="underline hover:text-gray-200 font-semibold transition"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;