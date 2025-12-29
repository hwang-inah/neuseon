// 파일 업로드

import { useRef } from 'react'
import styles from './FileUpload.module.css'

export default function FileUpload({ onUpload, onDownloadCSV, onDownloadExcel, disabled }) {
  const fileInputRef = useRef(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <div className={styles.buttonGroup}>
      <button
        className={styles.uploadButton}
        onClick={handleFileClick}
        disabled={disabled}
      >
        📤 파일 업로드
      </button>
      
      {/* <button
        className={styles.downloadButton}
        onClick={onDownloadCSV}
        disabled={disabled}
      >
        📥 CSV
      </button>

      <button
        className={styles.downloadButton}
        onClick={onDownloadExcel}
        disabled={disabled}
      >
        📥 엑셀
      </button> */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </div>
  )
}