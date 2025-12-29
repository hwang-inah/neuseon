// 비교 그래프 컴포넌트 (유료 기능 미리보기)

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './CompareChart.module.css'

export default function CompareChart({ data, isLocked = true }) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>월 단위 비교</h2>
      
      <div className={styles.chartWrapper}>
        {/* 그래프 */}
        <div className={isLocked ? styles.blurred : ''}>
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="thisMonth" 
                stroke="#8B7355" 
                strokeWidth={2}
                dot={{ fill: '#8B7355', r: 4 }}
                name="이번 달"
              />
              <Line 
                type="monotone" 
                dataKey="lastMonth" 
                stroke="#d1d5db" 
                strokeWidth={2}
                dot={{ fill: '#d1d5db', r: 4 }}
                name="지난 달"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 락 화면 */}
        {isLocked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockContent}>
              <div className={styles.lockIcon}>🔒</div>
              <h3 className={styles.lockTitle}>월 단위 비교는 구독에서 제공됩니다</h3>
              <p className={styles.lockDescription}>
                이번 달과 지난 달을 비교하고<br />
                매출 vs 지출 분석을 확인하세요
              </p>
              <button className={styles.subscribeButton}>
                구독하고 확인하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}