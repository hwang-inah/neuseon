// 단일 추이 그래프 컴포넌트 (무료)

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './TrendChart.module.css'

export default function TrendChart({ data, period }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        데이터가 없습니다
      </div>
    )
  }

  const title = period === 'thisYear' ? '월별 매출 추이' : '일별 매출 추이'

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12 }}
            stroke="#999"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#999"
            tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#8B7355" 
            strokeWidth={2}
            dot={{ fill: '#8B7355', r: 4 }}
            name="매출"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}