import React, { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useSales } from '../context/SaleContext'
import { formatCurrency, aggregateDataByPeriod } from '../utils/calculations'

Chart.register(...registerables)

export default function ProfitChart() {
  const canvasRef = useRef(null)
  const { sales } = useSales()
  const [filter, setFilter] = useState('day')

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    
    // Aggregate data based on selected filter
    const aggregatedData = aggregateDataByPeriod(sales, filter, 'profit')
    
    const labels = aggregatedData.map(item => {
      if (filter === 'day') {
        return new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else if (filter === 'week') {
        // period is the ISO date of the week start
        const d = new Date(item.period)
        const end = new Date(d)
        end.setDate(d.getDate() + 6)
        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      } else if (filter === 'month') {
        return new Date(item.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } else {
        return item.period
      }
    })
    
    const data = aggregatedData.map(item => Number(item.value.toFixed(2)))

    const chart = new Chart(ctx, {
      type: 'bar',
      data: { 
        labels, 
        datasets: [{ 
          label: 'Profit', 
          data, 
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(139, 92, 246, 0.9)',
          hoverBorderColor: 'rgba(139, 92, 246, 1)',
        }] 
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Profit: ${formatCurrency(context.parsed.y)}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              },
              maxRotation: 45
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#6B7280',
              font: {
                size: 11
              },
              callback: function(value) {
                return formatCurrency(value)
              }
            }
          }
        }
      }
    })

    return () => chart.destroy()
  }, [sales, filter])

  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0)

  return (
    <div className="modern-card p-6 group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit Trend</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your profit over time</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="sb-transition-base text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button className="sb-transition-base p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors">
            <i className="fas fa-ellipsis-h text-sm"></i>
          </button>
        </div>
      </div>
      
      <div className="relative" style={{height: 280}}>
        <canvas ref={canvasRef} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300">Total Profit</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(totalProfit)}
          </span>
        </div>
      </div>
    </div>
  )
}
