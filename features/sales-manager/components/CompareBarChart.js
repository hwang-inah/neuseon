// 비교 페이지용 그룹 막대 차트 + 증감률

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './CompareBarChart.module.css'

export default function CompareBarChart({ comparisonResult, period1Label, period2Label }) {
  if (!comparisonResult) return null

  const chartData = [
    {
      name: '매출',
      [period1Label]: comparisonResult.period1.income,
      [period2Label]: comparisonResult.period2.income,
      growth: comparisonResult.growth.income
    },
    {
      name: '지출',
      [period1Label]: comparisonResult.period1.expense,
      [period2Label]: comparisonResult.period2.expense,
      growth: comparisonResult.growth.expense
    },
    {
      name: '순익',
      [period1Label]: comparisonResult.period1.profit,
      [period2Label]: comparisonResult.period2.profit,
      growth: comparisonResult.growth.profit
    }
  ]

  // 증감률 커스텀 라벨
  const renderGrowthLabel = (props) => {
    const { x, y, width, value, index } = props
    const growth = chartData[index].growth
    const color = growth > 0 ? '#059669' : growth < 0 ? '#dc2626' : '#6b7280'
    
    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill={color} 
        textAnchor="middle"
        fontWeight="700"
        fontSize="14"
      >
        {growth > 0 ? '+' : ''}{growth}%
      </text>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>전월대비 비교 차트</h2>
      
      <ResponsiveContainer width="100%" height={450}>
        <BarChart 
          data={chartData}
          margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 14, fontWeight: 600 }}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
            cursor={{ fill: 'rgba(139, 115, 85, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            payload={[
              { value: period1Label, type: 'square', color: '#8B7355' },
              { value: period2Label, type: 'square', color: '#d1d5db' }
            ]}
          />
          {/* 기준월 먼저 (왼쪽) */}
          <Bar 
            dataKey={period1Label} 
            fill="#8B7355" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
          >
            <LabelList content={renderGrowthLabel} />
          </Bar>
          {/* 비교월 나중 (오른쪽) */}
          <Bar 
            dataKey={period2Label} 
            fill="#d1d5db" 
            radius={[8, 8, 0, 0]}
            maxBarSize={80}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}