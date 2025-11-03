import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Overview', icon: 'fas fa-home' },
    { id: 'getting-started', title: 'Getting Started', icon: 'fas fa-play' },
    { id: 'products', title: 'Product Management', icon: 'fas fa-box' },
    { id: 'sales', title: 'Sales Management', icon: 'fas fa-chart-line' },
    { id: 'purchases', title: 'Purchase Management', icon: 'fas fa-shopping-cart' },
    { id: 'batches', title: 'Batch Tracking', icon: 'fas fa-layer-group' },
    { id: 'analytics', title: 'Analytics & Reports', icon: 'fas fa-chart-pie' },
    { id: 'users', title: 'User Management', icon: 'fas fa-users-cog' },
    { id: 'settings', title: 'Settings', icon: 'fas fa-cog' },
    { id: 'api', title: 'API Reference', icon: 'fas fa-code' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: 'fas fa-tools' }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Oja Documentation</h1>
              <p className="text-xl text-gray-300 mb-8">
                Welcome to Oja, a comprehensive inventory management system designed to streamline your business operations.
              </p>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-3">What is Oja?</h2>
              <p className="text-blue-200">
                Oja is a modern, web-based inventory management system that helps businesses track products, 
                manage sales and purchases, monitor stock levels, and analyze performance through comprehensive 
                analytics and reporting tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Product catalog management</li>
                  <li>• Sales transaction tracking</li>
                  <li>• Purchase order management</li>
                  <li>• Advanced batch tracking</li>
                  <li>• Real-time analytics</li>
                  <li>• Role-based access control</li>
                  <li>• Mobile-responsive design</li>
                  <li>• Comprehensive reporting</li>
                </ul>
              </div>

              <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-3">Technology Stack</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Frontend:</strong> React 19, Tailwind CSS</li>
                  <li>• <strong>Backend:</strong> Supabase</li>
                  <li>• <strong>Database:</strong> PostgreSQL</li>
                  <li>• <strong>Charts:</strong> Chart.js, Recharts</li>
                  <li>• <strong>Authentication:</strong> Supabase Auth</li>
                  <li>• <strong>Deployment:</strong> Vite</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'getting-started':
        return (
            <div className="space-y-6">
              <div>
              <h1 className="text-4xl font-bold text-white mb-4">Getting Started</h1>
              <p className="text-xl text-gray-300">
                Learn how to set up and start using Oja for your inventory management needs.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Account Setup</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Creating Your Account</h3>
                    <p className="text-gray-300 mb-3">
                      To get started with Oja, you'll need to create an account:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                      <li>Navigate to the signup page</li>
                      <li>Enter your email address and create a secure password</li>
                      <li>Complete the email verification process</li>
                      <li>Set up your profile information</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">2. First Login</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Dashboard Overview</h3>
                    <p className="text-gray-300 mb-3">
                      After logging in, you'll see the main dashboard with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                      <li>Key performance metrics and statistics</li>
                      <li>Recent sales and purchase activities</li>
                      <li>Stock alerts and notifications</li>
                      <li>Quick access to main features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Initial Setup</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Adding Your First Product</h3>
                    <p className="text-gray-300 mb-3">
                      Start by adding your first product to the system:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
                      <li>Click the "Add" button on the dashboard or navigate to Products</li>
                      <li>Fill in the product details (name, category, description)</li>
                      <li>Set up pricing (unit, pack, carton prices)</li>
                      <li>Configure stock levels and minimum stock alerts</li>
                      <li>Upload product images if available</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'products':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Management</h1>
              <p className="text-xl text-gray-600">
                Comprehensive guide to managing your product catalog in Oja.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">Product Structure</h2>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Products in Oja support a hierarchical structure with three levels:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Units</h3>
                      <p className="text-sm text-gray-300">Individual items (e.g., 1 bottle, 1 piece)</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Packs</h3>
                      <p className="text-sm text-gray-300">Collections of units (e.g., 12 bottles per pack)</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Cartons</h3>
                      <p className="text-sm text-gray-300">Collections of packs (e.g., 6 packs per carton)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Adding Products</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Required Fields</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Name:</strong> Product name (required)</li>
                    <li><strong>Category:</strong> Product category for organization</li>
                    <li><strong>Description:</strong> Detailed product description</li>
                    <li><strong>Units per Pack:</strong> How many units make a pack</li>
                    <li><strong>Units per Carton:</strong> How many units make a carton</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Pricing Configuration</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Buying Prices:</strong> Cost prices for units, packs, and cartons</li>
                    <li><strong>Selling Prices:</strong> Retail prices for units, packs, and cartons</li>
                    <li><strong>Profit Margins:</strong> Automatically calculated based on buying/selling prices</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Batch Management</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Oja supports advanced batch tracking for better inventory control:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Batch Creation:</strong> Create batches when adding stock</li>
                    <li><strong>FIFO/LIFO Support:</strong> Automatic stock rotation based on batch dates</li>
                    <li><strong>Expiration Tracking:</strong> Monitor product expiration dates</li>
                    <li><strong>Batch Analytics:</strong> Track performance by batch</li>
                    <li><strong>Cost Tracking:</strong> Monitor costs per batch</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Stock Management</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Levels</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Current Stock:</strong> Real-time stock levels across all units</li>
                    <li><strong>Minimum Stock:</strong> Set alerts for low stock levels</li>
                    <li><strong>Stock Alerts:</strong> Automatic notifications when stock is low</li>
                    <li><strong>Stock Adjustments:</strong> Manual stock corrections when needed</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Stock Calculations</h3>
                  <p className="text-gray-600">
                    Stock levels are automatically calculated based on:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Initial stock additions</li>
                    <li>Purchase transactions</li>
                    <li>Sales transactions</li>
                    <li>Stock adjustments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'sales':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sales Management</h1>
              <p className="text-xl text-gray-600">
                Complete guide to managing sales transactions and tracking revenue in Oja.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Creating Sales</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Process</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Navigate to the Sales page</li>
                    <li>Click "Add Sale" button</li>
                    <li>Select the product from the dropdown</li>
                    <li>Enter quantity (units, packs, or cartons)</li>
                    <li>Set selling prices (if different from default)</li>
                    <li>Add any notes or additional information</li>
                    <li>Confirm the sale</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sales Features</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Multi-Unit Support</h3>
                  <p className="text-gray-600 mb-3">
                    Sales can be recorded in different units:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Unit Sales:</strong> Individual item sales</li>
                    <li><strong>Pack Sales:</strong> Multiple units sold as packs</li>
                    <li><strong>Carton Sales:</strong> Multiple packs sold as cartons</li>
                    <li><strong>Mixed Sales:</strong> Combination of different units</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Profit Calculation</h3>
                  <p className="text-gray-600 mb-3">
                    Oja automatically calculates profit for each sale:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Compares selling price with buying price</li>
                    <li>Accounts for batch costs when applicable</li>
                    <li>Provides profit margin percentages</li>
                    <li>Tracks total profit over time</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sales Analytics</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Available Reports</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Sales History:</strong> Complete transaction history</li>
                    <li><strong>Revenue Trends:</strong> Sales performance over time</li>
                    <li><strong>Product Performance:</strong> Best and worst selling products</li>
                    <li><strong>Profit Analysis:</strong> Profit margins and trends</li>
                    <li><strong>Daily/Weekly/Monthly Reports:</strong> Period-based analysis</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Sales Charts</h3>
                  <p className="text-gray-600 mb-3">
                    Visual representations of your sales data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Line charts for sales trends</li>
                    <li>Bar charts for product comparisons</li>
                    <li>Pie charts for category breakdowns</li>
                    <li>Profit margin visualizations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'purchases':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Purchase Management</h1>
              <p className="text-xl text-gray-600">
                Learn how to manage your inventory purchases and supplier relationships.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recording Purchases</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Process</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Navigate to the Purchases page</li>
                    <li>Click "Add Purchase" button</li>
                    <li>Select the product from the dropdown</li>
                    <li>Enter purchase quantity and type</li>
                    <li>Set purchase prices and costs</li>
                    <li>Add supplier information</li>
                    <li>Record purchase date</li>
                    <li>Add any notes or additional details</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purchase Types</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Unit Purchases</h3>
                      <p className="text-sm text-gray-600">Buying individual items</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Pack Purchases</h3>
                      <p className="text-sm text-gray-600">Buying items in packs</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Carton Purchases</h3>
                      <p className="text-sm text-gray-600">Buying items in cartons</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supplier Management</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Supplier Name:</strong> Track which supplier provided the goods</li>
                    <li><strong>Contact Information:</strong> Store supplier contact details</li>
                    <li><strong>Purchase History:</strong> Track purchases by supplier</li>
                    <li><strong>Cost Analysis:</strong> Compare costs across suppliers</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cost Management</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cost Tracking</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Cost per Unit:</strong> Track individual item costs</li>
                    <li><strong>Cost per Pack:</strong> Monitor pack-level costs</li>
                    <li><strong>Cost per Carton:</strong> Track carton-level costs</li>
                    <li><strong>Total Purchase Cost:</strong> Overall transaction cost</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Cost Analysis</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Compare costs across different suppliers</li>
                    <li>Track cost trends over time</li>
                    <li>Identify cost-saving opportunities</li>
                    <li>Monitor price fluctuations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'batches':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Batch Tracking</h1>
              <p className="text-xl text-gray-600">
                Advanced batch management system for precise inventory control and tracking.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are Batches?</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Batches in Oja represent specific groups of inventory items that share common characteristics:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Purchase Date:</strong> When the batch was acquired</li>
                    <li><strong>Cost Information:</strong> Specific costs for this batch</li>
                    <li><strong>Quantity:</strong> Number of items in the batch</li>
                    <li><strong>Expiration Date:</strong> When items expire (if applicable)</li>
                    <li><strong>Supplier:</strong> Who provided the batch</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Creating Batches</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Creation Process</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Navigate to a product's detail page</li>
                    <li>Click "Add Batch" button</li>
                    <li>Enter batch quantity (packs and units)</li>
                    <li>Set batch-specific costs</li>
                    <li>Set batch-specific selling prices</li>
                    <li>Add batch date and notes</li>
                    <li>Confirm batch creation</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">FIFO/LIFO Support</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inventory Rotation</h3>
                  <p className="text-gray-600 mb-3">
                    Oja supports both FIFO (First In, First Out) and LIFO (Last In, First Out) inventory management:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">FIFO (First In, First Out)</h4>
                      <p className="text-sm text-gray-600">
                        Older batches are sold first, ensuring proper inventory rotation and reducing waste.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">LIFO (Last In, First Out)</h4>
                      <p className="text-sm text-gray-600">
                        Newer batches are sold first, useful for certain business models.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Batch Analytics</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Performance</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Batch Profitability:</strong> Track profit per batch</li>
                    <li><strong>Turnover Rate:</strong> How quickly batches are sold</li>
                    <li><strong>Cost Analysis:</strong> Compare costs across batches</li>
                    <li><strong>Expiration Tracking:</strong> Monitor items approaching expiration</li>
                    <li><strong>Supplier Performance:</strong> Track batch quality by supplier</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics & Reports</h1>
              <p className="text-xl text-gray-600">
                Comprehensive analytics and reporting tools to understand your business performance.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard Analytics</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                      <li><strong>Total Revenue:</strong> Overall sales performance</li>
                      <li><strong>Total Profit:</strong> Net profit from operations</li>
                      <li><strong>Product Count:</strong> Number of active products</li>
                      <li><strong>Stock Value:</strong> Current inventory value</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                      <li><strong>Low Stock Alerts:</strong> Products needing restocking</li>
                      <li><strong>Expiring Items:</strong> Items approaching expiration</li>
                      <li><strong>Recent Sales:</strong> Latest transaction activity</li>
                      <li><strong>Top Products:</strong> Best performing items</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Performance</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Sales Trends:</strong> Revenue patterns over time</li>
                    <li><strong>Product Performance:</strong> Best and worst selling products</li>
                    <li><strong>Category Analysis:</strong> Performance by product category</li>
                    <li><strong>Seasonal Trends:</strong> Identify seasonal patterns</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Profit Analysis</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Profit Margins:</strong> Margin analysis by product</li>
                    <li><strong>Cost Trends:</strong> Purchase cost patterns</li>
                    <li><strong>Profitability Reports:</strong> Detailed profit breakdowns</li>
                    <li><strong>ROI Analysis:</strong> Return on investment metrics</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Visual Reports</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Line Charts</h4>
                      <p className="text-sm text-gray-600">
                        Track trends over time for sales, profits, and other metrics.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Bar Charts</h4>
                      <p className="text-sm text-gray-600">
                        Compare performance across products, categories, or time periods.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Pie Charts</h4>
                      <p className="text-sm text-gray-600">
                        Show distribution of sales, profits, or inventory by category.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Area Charts</h4>
                      <p className="text-sm text-gray-600">
                        Display cumulative data and trends with filled areas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Custom Reports</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Report Types</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Daily Reports:</strong> Day-by-day performance analysis</li>
                    <li><strong>Weekly Reports:</strong> Weekly performance summaries</li>
                    <li><strong>Monthly Reports:</strong> Monthly business overview</li>
                    <li><strong>Product Reports:</strong> Detailed product performance</li>
                    <li><strong>Inventory Reports:</strong> Stock level and value analysis</li>
                    <li><strong>Financial Reports:</strong> Revenue, profit, and cost analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">User Management</h1>
              <p className="text-xl text-gray-600">
                Role-based access control and user management system for secure operations.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Roles</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2">Admin</h3>
                      <p className="text-sm text-red-800 mb-2">Full system access</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Manage all users</li>
                        <li>• Access all features</li>
                        <li>• System settings</li>
                        <li>• User management</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-2">Manager</h3>
                      <p className="text-sm text-yellow-800 mb-2">Management access</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• View all data</li>
                        <li>• Manage products</li>
                        <li>• Access reports</li>
                        <li>• Limited user access</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-2">Sales Agent</h3>
                      <p className="text-sm text-green-800 mb-2">Basic access</p>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Record sales</li>
                        <li>• View products</li>
                        <li>• Basic reports</li>
                        <li>• Limited features</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Management Features</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Functions</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Create Users:</strong> Add new users to the system</li>
                    <li><strong>Assign Roles:</strong> Set appropriate roles for users</li>
                    <li><strong>Edit Profiles:</strong> Update user information</li>
                    <li><strong>Deactivate Users:</strong> Disable user accounts</li>
                    <li><strong>View Activity:</strong> Monitor user activity logs</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Profile Management</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Personal Information:</strong> Name, email, contact details</li>
                    <li><strong>Role Assignment:</strong> Assign appropriate system roles</li>
                    <li><strong>Permissions:</strong> Set feature access permissions</li>
                    <li><strong>Activity Tracking:</strong> Monitor user actions</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Security Features</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Control</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Row Level Security:</strong> Database-level access control</li>
                    <li><strong>Role-Based Access:</strong> Feature access based on roles</li>
                    <li><strong>User Isolation:</strong> Users can only access their own data</li>
                    <li><strong>Admin Override:</strong> Admins can access all data</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Activity Logging</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Action Tracking:</strong> Log all user actions</li>
                    <li><strong>Audit Trail:</strong> Complete history of changes</li>
                    <li><strong>Security Monitoring:</strong> Track suspicious activities</li>
                    <li><strong>Compliance:</strong> Meet regulatory requirements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings & Configuration</h1>
              <p className="text-xl text-gray-600">
                System settings and configuration options for customizing your Oja experience.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Settings</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">General Configuration</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Company Information:</strong> Business name and details</li>
                    <li><strong>Currency Settings:</strong> Default currency and formatting</li>
                    <li><strong>Date Formats:</strong> Date display preferences</li>
                    <li><strong>Time Zone:</strong> System time zone settings</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Inventory Settings</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Management</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Default Stock Alerts:</strong> Set default low stock thresholds</li>
                    <li><strong>Batch Settings:</strong> Configure batch tracking preferences</li>
                    <li><strong>Expiration Alerts:</strong> Set expiration warning periods</li>
                    <li><strong>Auto-Adjustments:</strong> Enable automatic stock adjustments</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Alert Configuration</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Low Stock Alerts:</strong> Configure stock level warnings</li>
                    <li><strong>Expiration Notifications:</strong> Set expiration alert periods</li>
                    <li><strong>Sales Notifications:</strong> Configure sales-related alerts</li>
                    <li><strong>Email Settings:</strong> Set up email notifications</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Management</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Backup & Export</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Data Export:</strong> Export data in various formats</li>
                    <li><strong>Backup Settings:</strong> Configure automatic backups</li>
                    <li><strong>Data Retention:</strong> Set data retention policies</li>
                    <li><strong>Migration Tools:</strong> Import/export data between systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">API Reference</h1>
              <p className="text-xl text-gray-600">
                Technical documentation for integrating with Oja's API endpoints.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Oja uses Supabase authentication for secure API access. All API requests require proper authentication.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Authentication Header</h3>
                    <code className="text-sm text-gray-700">
                      Authorization: Bearer {'<your-jwt-token>'}
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Endpoints</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Products API</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">GET /api/products</code> - List all products
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">POST /api/products</code> - Create new product
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">PUT /api/products/:id</code> - Update product
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">DELETE /api/products/:id</code> - Delete product
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Sales API</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">GET /api/sales</code> - List all sales
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">POST /api/sales</code> - Create new sale
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">PUT /api/sales/:id</code> - Update sale
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Purchases API</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">GET /api/purchases</code> - List all purchases
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">POST /api/purchases</code> - Create new purchase
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">PUT /api/purchases/:id</code> - Update purchase
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Models</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Product Model</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700">
{`{
  "id": "uuid",
  "name": "string",
  "category": "string",
  "description": "string",
  "units_per_pack": "integer",
  "units_per_carton": "integer",
  "unit_buying_price": "decimal",
  "pack_buying_price": "decimal",
  "carton_buying_price": "decimal",
  "unit_selling_price": "decimal",
  "pack_selling_price": "decimal",
  "carton_selling_price": "decimal",
  "current_stock": "integer",
  "minimum_stock": "integer",
  "image_url": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'troubleshooting':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Troubleshooting</h1>
              <p className="text-xl text-gray-600">
                Common issues and solutions to help you resolve problems quickly.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Issues</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Login Problems</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                      <li>Check your email and password for typos</li>
                      <li>Ensure your account is verified</li>
                      <li>Clear browser cache and cookies</li>
                      <li>Try using an incognito/private window</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Not Loading</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                      <li>Check your internet connection</li>
                      <li>Refresh the page</li>
                      <li>Clear browser cache</li>
                      <li>Try logging out and back in</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Issues</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                      <li>Close unnecessary browser tabs</li>
                      <li>Clear browser cache and cookies</li>
                      <li>Check your internet speed</li>
                      <li>Try using a different browser</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser Compatibility</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Supported Browsers</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Chrome 90+ (Recommended)</li>
                    <li>Firefox 88+</li>
                    <li>Safari 14+</li>
                    <li>Edge 90+</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Mobile Support</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>iOS Safari 14+</li>
                    <li>Android Chrome 90+</li>
                    <li>Responsive design for all screen sizes</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Help</h2>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Support Resources</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Documentation:</strong> Comprehensive guides and tutorials</li>
                    <li><strong>FAQ:</strong> Frequently asked questions</li>
                    <li><strong>Community Forum:</strong> User community support</li>
                    <li><strong>Email Support:</strong> Direct technical support</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Contact Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Email: support@oja.com</li>
                    <li>Response Time: Within 24 hours</li>
                    <li>Business Hours: Monday-Friday, 9 AM - 6 PM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-box text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-white">Oja</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Documentation</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <i className={`${section.icon} mr-2`}></i>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
