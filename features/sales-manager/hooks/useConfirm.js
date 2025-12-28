import { useState, useCallback } from 'react'

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({
    title: '',
    message: '',
    type: 'info', // 'info', 'create', 'update', 'delete'
    confirmText: '확인',
    cancelText: '취소'
  })
  const [resolvePromise, setResolvePromise] = useState(null)

  // 확인 모달 열기
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || '확인',
        message: options.message || '',
        type: options.type || 'info',
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        data: options.data || null
      })
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  // 확인 버튼 클릭
  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(true)
    }
  }, [resolvePromise])

  // 취소 버튼 클릭
  const handleCancel = useCallback(() => {
    setIsOpen(false)
    if (resolvePromise) {
      resolvePromise(false)
    }
  }, [resolvePromise])

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel
  }
}