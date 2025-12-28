import * as XLSX from 'xlsx'
import { parseNumber } from '@/shared/utils/formatUtils'

// 엑셀 시리얼 번호를 날짜로 변환
function excelDateToJSDate(serial) {
  // 엑셀은 1899년 12월 30일을 기준(0)으로 함
  const excelEpoch = new Date(1899, 11, 30)
  const days = Math.floor(serial)
  const milliseconds = days * 24 * 60 * 60 * 1000
  const date = new Date(excelEpoch.getTime() + milliseconds)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  console.log(`엑셀 시리얼 ${serial} → ${year}-${month}-${day}`)

  return `${year}-${month}-${day}`
}

// 날짜 값을 YYYY-MM-DD 형식으로 변환
function formatDateValue(value) {
  if (!value) return ''
  
  // 이미 YYYY-MM-DD 형식이면 그대로 반환
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  
  // 숫자(엑셀 시리얼)면 변환
  if (typeof value === 'number') {
    return excelDateToJSDate(value)
  }
  
  // YYYY-MM-DD 패턴 찾기
  if (typeof value === 'string') {
    const match = value.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
    if (match) {
      const [, year, month, day] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }
  
  return ''
}

// CSV 파싱
export function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

// 엑셀 파일 파싱
function parseExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  // 컬럼명 공백 제거
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' })
  
  // 모든 키의 공백 제거
  const cleanedData = jsonData.map(row => {
    const cleanRow = {}
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim()
      cleanRow[cleanKey] = row[key]
    })
    return cleanRow
  })
  
  return cleanedData
}

// 파일에서 데이터 추출 (CSV/Excel)
export async function parseFileToSalesData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    
    reader.onload = (e) => {
      try {
        let rows
        
        if (isExcel) {
          rows = parseExcel(e.target.result)
        } else {
          const text = e.target.result
          rows = parseCSV(text)
        }
        
        if (!rows || rows.length === 0) {
          reject(new Error('파일에 데이터가 없습니다'))
          return
        }
        
        const salesData = rows.map(row => {
          // 날짜 필드 찾기
          const dateValue = row['일자'] || row['date'] || row['날짜'] || row['Date']
          const formattedDate = formatDateValue(dateValue)
          
          return {
            date: formattedDate,
            // 추가 필드 (선택)
            category: row['구분'] || row['category'] || '',
            vendor: row['거래처명'] || row['vendor'] || '',
            description: row['내용'] || row['description'] || '',
            card: parseNumber(row['카드'] || row['card'] || '0'),
            transfer: parseNumber(row['계좌이체'] || row['transfer'] || '0'),
            cash: parseNumber(row['현금'] || row['cash'] || '0'),
            memo: row['메모'] || row['memo'] || ''
          }
        }).filter(row => row.date) // 날짜 있는 것만
        
        console.log('최종 변환된 데이터:', salesData)
        resolve(salesData)
      } catch (error) {
        console.error('파싱 에러:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    
    if (isExcel) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file)
    }
  })
}

// 데이터를 CSV로 변환
export function convertToCSV(data) {
  const headers = ['일자', '구분', '거래처명', '내용', '카드', '계좌이체', '현금', '총금액', '메모']
  const rows = data.map(row => {
    const card = parseNumber(row.card)
    const transfer = parseNumber(row.transfer)
    const cash = parseNumber(row.cash)
    const total = card + transfer + cash
    
    return [
      row.date,
      row.category || '',
      row.vendor || '',
      row.description || '',
      card,
      transfer,
      cash,
      total,
      row.memo || ''
    ].join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

// 데이터를 엑셀로 변환
export function convertToExcel(data) {
  const rows = data.map(row => {
    const card = parseNumber(row.card)
    const transfer = parseNumber(row.transfer)
    const cash = parseNumber(row.cash)
    const total = card + transfer + cash
    
    return {
      '일자': row.date,
      '구분': row.category || '',
      '거래처명': row.vendor || '',
      '내용': row.description || '',
      '카드': card,
      '계좌이체': transfer,
      '현금': cash,
      '총금액': total,
      '메모': row.memo || ''
    }
  })
  
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  return workbook
}

// CSV 다운로드
export function downloadCSV(data, filename) {
  const csv = convertToCSV(data)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 엑셀 다운로드
export function downloadExcel(data, filename) {
  const workbook = convertToExcel(data)
  XLSX.writeFile(workbook, filename)
}