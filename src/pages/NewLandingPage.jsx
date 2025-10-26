import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Minimal white design */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 flex justify-start">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600">
                  <i className="fas fa-database text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-gray-900">Oja</span>
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-all duration-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean, centered design with gradient */}
      <section className="pt-32 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Gradient circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-purple-100 to-cyan-100 opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-50 blur-3xl"></div>
          </div>

          <div className="relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight text-gray-900">
                Supercharge your inventory management
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Advanced inventory management platform powered by AI. Track products, optimize stock levels, and make data-driven decisions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/signup" className="bg-black text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center">
                  Start Free Trial
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>

              {/* Product Preview */}
              <div className="relative mt-20">
                <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
                  <div className="relative z-10">
                    <img 
                      src="/path/to/dashboard-preview.png" 
                      alt="Oja Dashboard" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean cards with icons */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Everything you need to manage inventory
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features that help you track products and optimize your operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Real-time Analytics</h3>
              <p className="text-gray-600">Get instant insights into your inventory levels and sales performance</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-boxes text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Stock Management</h3>
              <p className="text-gray-600">Track stock levels and get alerts when inventory runs low</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-robot text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">AI-Powered Insights</h3>
              <p className="text-gray-600">Let AI help you optimize stock levels and predict demand</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Logos */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Trusted by innovative companies
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            {/* Replace with actual company logos */}
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Ready to transform your inventory management?
          </h2>
          <Link to="/signup" className="bg-black text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-all duration-200 inline-flex items-center justify-center">
            Get Started Free
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600">
                <i className="fas fa-database text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">Oja</span>
            </div>

            <div className="flex justify-center space-x-8 mb-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">About</a>
              <Link to="/documentation" className="text-gray-600 hover:text-gray-900 text-sm">Documentation</Link>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Contact</a>
            </div>

            <p className="text-gray-600 text-sm">
              &copy; 2024 Oja. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}