import { useState, useEffect } from "react";
import {
  Camera,
  Cloud,
  Share,
  Eye,
  Brain,
  X,
  Zap,
  Palette,
  QrCode,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "@/constants/RouteContant";

const LandingPage = () => {
    const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTrialClick = () => {
    setShowContactModal(true);
  };

  return (
    <div className=" bg-[#0f0f0f] text-slate-100 min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0f0f0f] to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>

        {/* Floating orbs animation */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-600/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

    

      {/* Fixed Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/captus-name-side-bg.png"
                alt="Captus Logo"
                className="w-48"
              />
            </div>

            {/* Center Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-400 hover:text-slate-100 transition-colors relative group"
              >
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-400 hover:text-slate-100 transition-colors relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-slate-400 hover:text-slate-100 transition-colors relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTrialClick}
                className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Free Trial
              </button>
              <button onClick={() => {navigate(LOGIN_ROUTE)}} className="border border-slate-600 text-slate-100 hover:border-slate-400 px-6 py-2 rounded-xl transition-all hover:scale-105">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Launch Offer Popup - Bottom Right */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 z-[60] animate-scale-in">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg">🚀</span>
              </div>
              <div className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                LAUNCH OFFER
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                50 GB FREE
              </h3>

              <div className="space-y-1 mb-4 text-gray-300 text-md flex-col justify-start">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>No Payment Required</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Unlimited Events</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span>Unique Portfolio</span>
                </div>
              </div>

              <button
                onClick={handleTrialClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 text-lg w-full"
              >
                Claim 50GB Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Hero Background Illustration - Camera Shutter */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-blue-900/20"></div>

          {/* Camera Shutter Opening Animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96">
            <div className="relative w-full h-full">
              {/* Shutter Blades */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${i * 45}deg)`,
                    animation: `shutterOpen 4s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div className="w-2 h-32 bg-gradient-to-b from-blue-600/40 to-transparent mx-auto rounded-full blur-sm"></div>
                </div>
              ))}

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-md animate-pulse"></div>
            </div>
          </div>

          {/* Lighting Flares */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full blur-sm animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full blur-sm animate-ping delay-1000"></div>
          <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full blur-sm animate-ping delay-2000"></div>

          {/* Floating Camera Icons */}
          <div className="absolute top-20 left-20 text-4xl opacity-20 animate-pulse">
            📸
          </div>
          <div className="absolute top-32 right-32 text-3xl opacity-20 animate-pulse delay-1000">
            ⚡
          </div>
          <div className="absolute bottom-40 left-40 text-3xl opacity-20 animate-pulse delay-2000">
            🎯
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Efforless Media Sharing
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-8  animate-fade-in">
            Save hours. Deliver stunning galleries. Let your creativity shine.
          </p>
          <button
            onClick={handleTrialClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 animate-fade-in hover:shadow-lg hover:shadow-blue-600/25"
          >
            Start Free
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">
              Three simple steps to transform your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Store */}
            <div className="bg-slate-800/50 rounded-xl p-8 text-center hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600/30 transition-colors">
                <Cloud className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Store</h3>
              <p className="text-slate-400">
                Securely upload your media to the cloud with zero hassle.
              </p>
            </div>

            {/* Share */}
            <div className="bg-slate-800/50 rounded-xl p-8 text-center hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600/30 transition-colors">
                <Share className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Share</h3>
              <p className="text-slate-400 ">
                Instantly share albums with your clients via private links.
              </p>
            </div>

            {/* Show */}
            <div className="bg-slate-800/50 rounded-xl p-8 text-center hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600/30 transition-colors">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Show</h3>
              <p className="text-slate-400 ">
                Deliver stunning galleries and immersive viewing experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-6 md:px-12 bg-slate-900/30 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Features
            </h2>
            <p className="text-xl text-slate-400 ">
              Powerful tools designed to elevate your photography business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Powered Galleries */}
            <div className="bg-slate-800/50 rounded-xl p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* AI Brain Illustration */}
                <div className="relative z-10 flex items-center justify-center h-full">
                  <Brain className="h-16 w-16 text-blue-600 animate-pulse" />
                </div>

                {/* Holographic galleries floating around */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-8 h-6 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded border border-blue-400/50"
                    style={{
                      top: `${20 + i * 10}%`,
                      left: `${10 + (i % 2) * 70}%`,
                      animation: `float 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded flex items-center justify-center text-xs">
                      🖼️
                    </div>
                  </div>
                ))}

                {/* Neural network connections */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                  <defs>
                    <linearGradient
                      id="connectionGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="#8B5CF6"
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line
                      key={i}
                      x1={`${20 + i * 10}%`}
                      y1={`${30 + i * 5}%`}
                      x2="50%"
                      y2="50%"
                      stroke="url(#connectionGradient)"
                      strokeWidth="1"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </svg>
              </div>

              <div className="relative z-20">
                <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  AI Powered Galleries
                </h3>
                <p className="text-slate-400 ">
                  Simply beautiful image delivery. Impressive photo galleries
                  designed to make image delivery effortless.
                </p>
              </div>
            </div>

            {/* Lightning Fast */}
            <div className="bg-slate-800/50 rounded-xl p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-yellow-500/50 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Speed lines animation */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
                    style={{
                      top: `${10 + i * 10}%`,
                      animation: `speedLine 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}

                {/* Lightning bolts */}
                <div className="absolute top-1/4 left-1/4 text-yellow-400 opacity-30 animate-ping">
                  ⚡
                </div>
                <div className="absolute bottom-1/4 right-1/4 text-yellow-400 opacity-30 animate-ping delay-500">
                  ⚡
                </div>
              </div>

              <div className="relative z-20">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-600/30 transition-colors">
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-slate-400 ">
                  Upload, organize, and share thousands of photos in seconds.
                  Our optimized platform handles massive volumes without
                  breaking a sweat.
                </p>
              </div>
            </div>

            {/* Your Brand, Your Way */}
            <div className="bg-slate-800/50 rounded-xl p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Brand elements animation */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-purple-400/50 rounded animate-spin"></div>
                <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce"></div>
                <div className="absolute top-3/4 left-1/2 w-4 h-4 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded animate-pulse"></div>

                {/* Floating brand icons */}
                <div className="absolute top-1/3 right-1/3 text-purple-400 opacity-30 animate-pulse">
                  🎨
                </div>
                <div className="absolute bottom-1/3 left-1/3 text-purple-400 opacity-30 animate-pulse delay-1000">
                  ✨
                </div>
              </div>

              <div className="relative z-20">
                <div className="w-16 h-16 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600/30 transition-colors">
                  <Palette className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  Your Brand, Your Way
                </h3>
                <p className="text-slate-400 ">
                  Complete branding control with custom domains, logos, and
                  styling. Present your work professionally and build client
                  trust.
                </p>
              </div>
            </div>

            {/* QR Code Based Sharing */}
            <div className="bg-slate-800/50 rounded-xl p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-green-500/50 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* QR code pattern animation */}
                <div className="absolute inset-4 grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-full bg-green-400/30 rounded-sm"
                      style={{
                        animation: `qrPulse 3s ease-in-out infinite`,
                        animationDelay: `${(i % 8) * 0.1}s`,
                        opacity: Math.random() > 0.5 ? 1 : 0,
                      }}
                    />
                  ))}
                </div>

                {/* Scanning line */}
                <div className="absolute inset-4 border-2 border-green-400/50 rounded">
                  <div className="w-full h-0.5 bg-green-400/70 animate-pulse"></div>
                </div>
              </div>

              <div className="relative z-20">
                <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600/30 transition-colors">
                  <QrCode className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">QR Code Sharing</h3>
                <p className="text-slate-400 ">
                  Instant access with QR codes. Guests simply scan and download
                  their photos immediately - no apps or accounts required.
                </p>
              </div>
            </div>

            {/* Personal Portfolio */}
            <div className="bg-slate-800/50 rounded-xl p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-slate-700/50 hover:border-pink-500/50 group relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {/* Portfolio grid animation */}
                <div className="absolute inset-4 grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full h-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 rounded"
                      style={{
                        animation: `portfolioFloat 4s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded flex items-center justify-center text-xs">
                        {i % 3 === 0 ? "📸" : i % 3 === 1 ? "🎨" : "✨"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating elements */}
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-1000"></div>
              </div>

              <div className="relative z-20">
                <div className="w-16 h-16 bg-pink-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-600/30 transition-colors">
                  <User className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">
                  Personal Portfolio
                </h3>
                <p className="text-slate-400 ">
                  Showcase your best work with stunning portfolio galleries.
                  Professional presentation that converts viewers into clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Try for Free Section */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Try Captus Background Illustration - Futuristic Photo Gallery */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#0f0f0f] to-blue-900/30"></div>

          {/* Futuristic photo gallery grid */}
          <div className="absolute inset-0 grid grid-cols-8 gap-2 p-8 opacity-20">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded border border-blue-400/30"
                style={{
                  animation: `glow 3s ease-in-out infinite`,
                  animationDelay: `${(i % 8) * 0.2}s`,
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded flex items-center justify-center text-xs">
                  {i % 3 === 0 ? "📸" : i % 3 === 1 ? "🎨" : "✨"}
                </div>
              </div>
            ))}
          </div>

          {/* Glowing particles for elegance and freedom */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full blur-sm animate-ping"></div>
          <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-purple-400 rounded-full blur-sm animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-pink-400 rounded-full blur-sm animate-ping delay-2000"></div>

          {/* Flowing elements for freedom feeling */}
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-20 bg-gradient-to-b from-blue-400/30 to-transparent"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${10 + i * 15}%`,
                  animation: `flow 4s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                  transform: `rotate(${45 + i * 30}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Try Captus for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FREE
            </span>
          </h2>
          <button
            onClick={handleTrialClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
          >
            Try for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-[#0a0a0a] py-16 px-6 md:px-12 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Left - Logo and Description */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/captus-name-logo-bg.png"
                  alt="Captus Logo"
                  className="w-36"
                />
              </div>
              <p className="text-slate-400 font">
                Effortless Media Sharing
              </p>
            </div>

            {/* Center - Navigation */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-400 hover:text-slate-100 transition-colors text-left"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-400 hover:text-slate-100 transition-colors text-left"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-slate-400 hover:text-slate-100 transition-colors text-left"
              >
                Contact
              </button>
            </div>

            
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Captus. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shutterOpen {
          0%, 100% { transform: rotate(var(--rotation)) scale(1); }
          50% { transform: rotate(var(--rotation)) scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
        }
        
        @keyframes flow {
          0%, 100% { opacity: 0.3; transform: translateY(0px) rotate(var(--rotation)); }
          50% { opacity: 0.8; transform: translateY(-20px) rotate(var(--rotation)); }
        }
        
        @keyframes speedLine {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes qrPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes portfolioFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-5px) scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
