import React from "react";
import { Link } from "react-router-dom";
import MapComponent from "../MapComponent";
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
    h1, h2, h3 { font-family: 'Playfair Display', serif; }
    .glass-card {
      background: rgba(15, 30, 45, 0.6);
      backdrop-filter: blur(15px);
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
    .header-shadow { text-shadow: 0px 3px 15px rgba(0, 0, 0, 0.5); }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in-up { animation: fadeInUp 1s ease-out forwards; }
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
        {/* Hero Section */}
        <div className="w-full flex-grow flex flex-col justify-center pt-24 md:pt-28">
          <main className="flex-grow flex items-center justify-center p-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 header-shadow fade-in-up">
                Restore Order to Our Caravan City
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 fade-in-up">
                Spot a broken lantern, a muddy path, or a frayed safety net? Share it here.
                Our crew will respond, resolve, and keep the travelling circus safe for everyone.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 fade-in-up">
                <Link
                  to="/report"
                  className="btn-primary-gradient text-white font-bold py-4 px-10 text-lg rounded-xl inline-block w-full sm:w-auto"
                >
                  Report a New Issue
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary-outline font-bold py-4 px-10 text-lg rounded-xl inline-block w-full sm:w-auto"
                >
                  Sign In to Track &amp; Verify
                </Link>
              </div>
            </div>
          </main>

          {/* How It Works */}
          <section id="how-it-works" className="w-full p-4 py-16">
            <div className="container mx-auto max-w-6xl text-center">
              <h2 className="text-4xl font-bold mb-12 header-shadow text-white">
                How We Put Every Complaint on the Map
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">📍</div>
                  <h3 className="text-2xl font-semibold mb-2">Pinpoint the Problem</h3>
                  <p className="text-gray-300">
                    Drop a marker where tents leak, wires spark, or pathways break. Give us the exact spot.
                  </p>
                </div>
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-2xl font-semibold mb-2">Log the Hazard</h3>
                  <p className="text-gray-300">
                    Add details, attach evidence if you can, and create a ticket our maintenance crew can act on.
                  </p>
                </div>
                <div className="glass-card p-8 rounded-2xl">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-semibold mb-2">Confirm the Fix</h3>
                  <p className="text-gray-300">
                    Follow progress, get alerts when work is done, and verify the fix before we close the case.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ✅ Live City Status Section */}
          <section id="live-status" className="w-full p-4 pb-16">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white header-shadow">
                  Field Control Center
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ✅ Issue Heatmap */}
                <div className="lg:col-span-2">
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <h3 className="text-2xl font-bold mb-4">Active Incident Map</h3>
                    <div className="rounded-lg overflow-hidden" style={{ height: "420px" }}>
                      <MapComponent />
                    </div>
                  </div>
                </div>

                {/* Live Feed */}
                <div>
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <h3 className="text-2xl font-bold mb-4">Latest dispatches</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 border-b border-gray-700/50 pb-3">
                        <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">Loose rigging above aerial ring</p>
                          <p className="text-xs text-gray-400">Status: Crew on site</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-b border-gray-700/50 pb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">Flooded walkway behind food stalls</p>
                          <p className="text-xs text-gray-400">Status: Awaiting pump-out</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-cyan-400 flex-shrink-0"></div>
                        <div>
                          <p className="font-semibold text-white">Replaced lanterns along caravan row</p>
                          <p className="text-xs text-gray-400">Status: Verified by citizen</p>
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
