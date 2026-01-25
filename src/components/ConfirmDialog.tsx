type Props = {
  isOpen: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ isOpen, title = 'Confirm', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" data-testid="confirm-dialog">
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="mb-4 text-gray-200">{message}</div>
        <div className="flex justify-end gap-2">
          <button data-testid="confirm-cancel" onClick={onCancel} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">{cancelLabel}</button>
          <button data-testid="confirm-confirm" onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 hover:bg-red-500">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
