import { useTranslation } from "../i18n";
import { X } from "lucide-react";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsoleModal: React.FC<ConsoleModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 duration-200 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative bg-[#1e1e1e] border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <span>🚀</span> {t("msg.about_title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto border bg-blue-600/20 rounded-2xl border-blue-500/30">
            <span className="text-4xl font-black text-blue-400">KL</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">KoreLang Core</h3>
            <p className="text-sm text-neutral-400">
              Professional Linguistic Development Environment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleModal;
