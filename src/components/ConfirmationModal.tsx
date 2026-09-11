import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-xl border border-[#E8E1D7] overflow-hidden p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <span
              className={`p-2.5 rounded-full shrink-0 ${
                isDestructive ? 'bg-red-50 text-red-700' : 'bg-[#EBF0EC] text-[#1C3B2B]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#1C3B2B]">{title}</h3>
              <p className="text-xs text-[#6B726C] mt-1 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-[#8C948D] hover:text-[#1C3B2B] rounded-lg"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E1D7]">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#6B726C] hover:bg-[#EAE2D8] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                isDestructive
                  ? 'bg-red-700 text-white hover:bg-red-800'
                  : 'bg-[#1C3B2B] text-[#FAF7F2] hover:bg-[#152D1F]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
