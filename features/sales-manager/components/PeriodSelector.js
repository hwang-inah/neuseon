// 기간 선택 컴포넌트

import styles from './PeriodSelector.module.css'

const PERIODS = [
  { value: 'thisMonth', label: '이번 달' },
  { value: 'lastMonth', label: '지난 달' },
  { value: 'thisYear', label: '올해' }
]

export default function PeriodSelector({ period, onChange }) {
  return (
    <div className={styles.container}>
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`${styles.button} ${period === p.value ? styles.active : ''}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}