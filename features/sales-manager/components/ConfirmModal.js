import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ 
  isOpen, 
  config, 
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null

  // 타입별 스타일
  const getTypeStyle = () => {
    switch (config.type) {
      case 'delete':
        return {
          icon: '⚠️',
          iconBg: '#ffebee',
          buttonBg: '#d32f2f'
        }
      case 'create':
        return {
          icon: '➕',
          iconBg: '#e8f5e9',
          buttonBg: '#8B7355'
        }
      case 'update':
        return {
          icon: '✏️',
          iconBg: '#e3f2fd',
          buttonBg: '#8B7355'
        }
      default:
        return {
          icon: 'ℹ️',
          iconBg: '#f5f5f5',
          buttonBg: '#8B7355'
        }
    }
  }

  const typeStyle = getTypeStyle()

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 아이콘 */}
        <div 
          className={styles.icon}
          style={{ backgroundColor: typeStyle.iconBg }}
        >
          {typeStyle.icon}
        </div>

        {/* 제목 */}
        <h3 className={styles.title}>
          {config.title}
        </h3>

        {/* 메시지 */}
        <p className={styles.message}>
          {config.message}
        </p>

        {/* 데이터 표시 */}
        {config.data && (
          <div className={styles.data}>
            {Object.entries(config.data).map(([key, value]) => (
              <div key={key} className={styles.dataItem}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        )}

        {/* 버튼 */}
        <div className={styles.buttons}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
          >
            {config.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            style={{ backgroundColor: typeStyle.buttonBg }}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}