import React, { useContext, useState } from "react";
import { AuthContext } from "@/Context/AuthContext";

const LoginPage = () => {
  const { login, loading } = useContext(AuthContext);
  const [form, setForm] = useState({ email_or_phone: "", password: "" });
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState<"email" | "phone">("email");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const credentials = {
        email_or_phone: form.email_or_phone,
        password: form.password
      };
      
      await login(credentials);
      alert("Logged in successfully ✅");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 overflow-hidden">
      {/* خلفية بسيطة لعيادة الأسنان */}
      <div className="absolute inset-0 bg-white/60"></div>
      
      {/* عناصر زينة بسيطة */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full translate-x-1/2 translate-y-1/2 opacity-40"></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-100 rounded-full opacity-30"></div>

      <div className="relative z-10 max-w-md w-full p-10 bg-gradient-to-tr from-[#039fb3]/80 to-[#039fb3]/60 rounded-3xl shadow-lg backdrop-blur-md border border-white/20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logs.png"
            alt="Dental Clinic Logo"
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