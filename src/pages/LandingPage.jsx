import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: 'fas fa-database',
      title: 'Postgres Database',
      description: 'Every project is a full Postgres database, the world\'s most trusted relational database. 100% portable with built-in Auth and RLS.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Authentication',
      description: 'Add user sign ups and logins, securing your data with Row Level Security and enterprise-grade security.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Edge Functions',
      description: 'Easily write custom code without deploying or scaling servers. Serverless functions at the edge.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'fas fa-cloud',
      title: 'Realtime',
      description: 'Build multiplayer experiences with real-time data synchronization and instant updates.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { number: '90.5K', label: 'GitHub Stars' },
    { number: '99.9%', label: 'Uptime SLA' },
    { number: '50+', label: 'Countries' },
    { number: '24/7', label: 'Support' }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'VP of Operations',
      company: 'TechCorp Global',
      content: 'Oja transformed our inventory management. We reduced costs by 30% and improved efficiency by 200%.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Supply Chain Director',
      company: 'Manufacturing Solutions Inc.',
      content: 'The analytics and batch tracking features are game-changers. We can now predict demand with 95% accuracy.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emily Watson',
      role: 'CEO',
      company: 'Retail Innovations',
      content: 'Oja\'s user management and security features give us complete confidence in our operations.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600">
                <i className="fas fa-database text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">Oja</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Pricing</a>
              <Link to="/documentation" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">Docs</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-all duration-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-gray-900">
                Streamline your inventory management workflow
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Powerful inventory management platform that helps you track products, manage sales, and get real-time insights. Perfect for businesses of all sizes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/signup" className="group bg-black text-white px-8 py-4 rounded-md text-base font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center">
                  <span>Get Started Free</span>
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </Link>
                <button className="bg-gray-100 text-gray-900 px-8 py-4 rounded-md text-base font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center">
                  <i className="fas fa-play mr-2"></i>
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-12 mb-16">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-1 text-gray-900">
                      {stat.number}
                    </div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mx-auto mt-16 max-w-6xl">
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl">
                {/* Background gradient for the image container */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100"></div>
                
                {/* Dashboard Preview */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {/* Browser Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-sm">Oja Dashboard</div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">Dashboard</h3>
                        <p className="text-gray-400">Welcome back! Here's what's happening with your inventory.</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-plus text-white"></i>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">$24,567</div>
                        <div className="text-gray-400 text-sm">Total Revenue</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">1,234</div>
                        <div className="text-gray-400 text-sm">Products</div>
                      </div>
                    </div>
                    
                    {/* Chart Area */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold">Sales Analytics</h4>
                        <div className="text-gray-400 text-sm">Last 30 days</div>
                      </div>
                      <div className="h-32 bg-gray-600 rounded flex items-center justify-center">
                        <div className="text-gray-400">📊 Chart Visualization</div>
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300">New sale: Product A - $150</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-300">Stock updated: Product B</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-300">Low stock alert: Product C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decoration for image area */}
              <div className="absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 bg-blue-500"></div>
              <div className="absolute -bottom-4 -left-4 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20 bg-cyan-500"></div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-10 bg-blue-500"></div>
          <div className="absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 bg-cyan-500"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-10 bg-purple-500"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Everything you need to manage inventory
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that help you track products, manage sales, and get real-time insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <i className={`${feature.icon} text-blue-600 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Visualization */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-700 rounded-3xl p-8 border border-gray-600 shadow-lg">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center mx-auto mb-4`}>
                <i className={`${features[activeFeature].icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{features[activeFeature].title}</h3>
              <p className="text-gray-300">{features[activeFeature].description}</p>
            </div>
            
            {/* Mock Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm">Live Dashboard</div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${features[activeFeature].color} rounded-full`} style={{width: '85%'}}></div>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${features[activeFeature].color} rounded-full`} style={{width: '72%'}}></div>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${features[activeFeature].color} rounded-full`} style={{width: '93%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Trusted by Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how industry leaders are transforming their operations with Oja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-sm"></i>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of enterprises already using Oja to streamline their supply chain operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup" className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
              Start Your Free Trial
            </Link>
            <Link to="/documentation" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Explore Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500">
                  <i className="fas fa-database text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-white">Oja</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The enterprise-grade inventory management platform trusted by growing businesses worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2024 Oja. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}