import React from "react";
import { Link } from "react-router-dom";

// It's best practice to move these styles to your index.css file,
// but they are included here for a complete, single-file component.
const GlobalStyles = () => (
  <style>{`
    body {
      font-family: 'Lato', sans-serif;
      background-image: url('https://images.unsplash.com/photo-1533109721025-d1ae7de8c242?q=80&w=1974&auto-format&fit=crop');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      overflow-x: hidden;
      position: relative;
    }
    
    body::before {
      content: '';
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 20, 35, 0.75);
      z-index: -1;
    }

    h1, h2, h3 {
      font-family: 'Playfair Display', serif;
    }

    .glass-card {
      background: rgba(15, 30, 45, 0.6);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-primary-gradient {
      background-image: linear-gradient(to right, #0891b2, #0d9488);
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px 0 rgba(8, 145, 178, 0.3);
    }
    .btn-primary-gradient:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(8, 145, 178, 0.45);
    }
    
    .btn-secondary-outline {
      color: #f59e0b;
      border: 2px solid #f59e0b;
      transition: all 0.3s ease;
    }
    .btn-secondary-outline:hover {
      background-color: rgba(245, 158, 11, 0.1);
      transform: translateY(-2px);
    }

    .text-gold { color: #f59e0b; }
    
    .header-shadow {
      text-shadow: 0px 3px 15px rgba(0, 0, 0, 0.5);
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in-up {
      animation: fadeInUp 1s ease-out forwards;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .ferris-wheel-animation {
      animation: spin 120s linear infinite;
    }
  `}</style>
);

const HomePage = () => {
  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen w-full flex flex-col items-center text-gray-200 relative isolate">
        {/* Background Ferris Wheel Element */}
        <div className="absolute inset-0 flex items-center justify-center z-[-1] overflow-hidden">
          <svg
            className="w-full h-full max-w-5xl max-h-5xl text-white opacity-10 ferris-wheel-animation"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="250"
              cy="250"
              r="230"
              stroke="currentColor"
              strokeWidth="2"
            />
            {[...Array(12)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 30} 250 250)`}>
                <line
                  x1="250"
                  y1="250"
                  x2="250"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="250"
                  cy="20"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="rgba(15, 30, 45, 0.5)"
                />
              </g>
            ))}
            <circle
              cx="250"
              cy="250"
              r="40"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Improved Header */}
        <header className="w-full p-4 fixed top-0 z-50">
          <nav className="container mx-auto max-w-7xl glass-card rounded-2xl p-4 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl tracking-tight font-bold header-shadow"
            >
              Caravan Chronicle
            </Link>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <a
                href="#live-status"
                className="hover:text-gold transition-colors"
              >
                Live Status
              </a>
              <a
                href="#how-it-works"
                className="hover:text-gold transition-colors"
              >
                How It Works
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="hover:text-gold transition-colors font-semibold text-sm px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary-gradient font-semibold py-2 px-5 rounded-lg text-sm"
              >
                Register
              </Link>
            </div>
          </nav>
        </header>

        <div className="w-full flex-grow flex flex-col justify-center pt-28">
          {/* Hero Section */}
          <main className="flex-grow flex items-center justify-center p-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 header-shadow fade-in-up">
                Keeping the Magic in Motion
              </h1>
              <p
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                The official portal for maintaining the splendor of the Circus
                of Wonders. Report, track, and witness the resolution of civic
                issues.
              </p>
              <div
                className="flex flex-col sm:flex-row justify-center items-center gap-4 fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <Link
                  to="/report"
                  className="btn-primary-gradient text-white font-bold py-4 px-10 text-lg rounded-xl inline-block w-full sm:w-auto"
                >
                  Report a New Issue
                </Link>
                <Link
                  to="/track"
                  className="btn-secondary-outline font-bold py-4 px-10 text-lg rounded-xl inline-block w-full sm:w-auto"
                >
                  Track an Existing Issue
                </Link>
              </div>
            </div>
          </main>

          {/* How It Works Section */}
          <section id="how-it-works" className="w-full p-4 py-16">
            <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-4xl font-bold mb-12 header-shadow text-white">
                A Simple Path to Resolution
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">📍</div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Pinpoint the Problem
                  </h3>
                  <p className="text-gray-300">
                    Use our interactive map to drop a pin on the exact location
                    of any issue.
                  </p>
                </div>
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">🎫</div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Create a Chronicle
                  </h3>
                  <p className="text-gray-300">
                    Submit a report with details and a photo to receive a unique
                    tracking ticket.
                  </p>
                </div>
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Witness the Magic
                  </h3>
                  <p className="text-gray-300">
                    Receive real-time updates and a final notification when the
                    issue is resolved.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Live Status Section */}
          <section id="live-status" className="w-full p-4 pb-16">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white header-shadow">
                  Live City Status
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <h3 className="text-2xl font-bold mb-4">Issue Heatmap</h3>
                    <div className="aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <img
                        src="https://i.pinimg.com/originals/e7/73/19/e773197593c76a404b905f88f25381a1.jpg"
                        alt="Map of the Circus of Wonders"
                        className="object-cover rounded-lg h-full w-full opacity-70"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <h3 className="text-2xl font-bold mb-4">Live Feed</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 border-b border-gray-700/50 pb-3">
                        <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">
                            Flickering Lights at Main Stage
                          </p>
                          <p className="text-xs text-gray-400">
                            Status: In Progress
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-b border-gray-700/50 pb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">
                            Overflowing Bin near Midway
                          </p>
                          <p className="text-xs text-gray-400">
                            Status: Overdue
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">
                            Damaged Safety Rail
                          </p>
                          <p className="text-xs text-gray-400">
                            Status: Resolved
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default HomePage;
