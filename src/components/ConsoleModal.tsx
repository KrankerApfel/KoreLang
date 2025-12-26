import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n";
import { X, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import ConsoleConfig from "./ConsoleConfig";
import {
  ProjectConstraints,
  AppSettings,
  LexiconEntry,
  LogEntry,
  ScriptConfig,
  ViewState,
} from "../types";

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;

  // forwarded to ConsoleConfig
  constraints: ProjectConstraints;
  setConstraints: (c: ProjectConstraints) => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  entries: LexiconEntry[];
  setEntries: React.Dispatch<React.SetStateAction<LexiconEntry[]>>;
  history: LogEntry[];
  setHistory: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  setProjectAuthor: (author: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setView: (view: ViewState) => void;
  setJumpToTerm: (term: string | null) => void;
  setDraftEntry: (entry: Partial<LexiconEntry> | null) => void;
  scriptConfig?: ScriptConfig;
  isScriptMode?: boolean;
  author?: string;
}

const ConsoleModal: React.FC<ConsoleModalProps> = ({
  isOpen,
  onClose,
  constraints,
  setConstraints,
  settings,
  setSettings,
  entries,
  setEntries,
  history,
  setHistory,
  setProjectName,
  setProjectDescription,
  setProjectAuthor,
  setIsSidebarOpen,
  setView,
  setJumpToTerm,
  setDraftEntry,
  scriptConfig,
  isScriptMode,
  author,
}) => {
  const { t } = useTranslation();

  const [height, setHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("console_panel_height");
      if (saved) return Math.max(120, Math.min(window.innerHeight - 100, parseInt(saved, 10)));
    } catch (e) {
    }
    return 320;
  });

  const resizingRef = useRef(false);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(height);

  const prevHeightRef = useRef(height);

  // match the app footer bar height (Tailwind h-6 = 1.5rem = 24px)
  const MINIMIZED_HEIGHT = 24;
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem("console_panel_minimized") === "1";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (!isMinimized) {
        localStorage.setItem("console_panel_height", String(height));
      }
    } catch (e) {
    }
  }, [height, isMinimized]);

  useEffect(() => {
    try {
      localStorage.setItem("console_panel_minimized", isMinimized ? "1" : "0");
    } catch (e) {
    }
  }, [isMinimized]);

  useEffect(() => {
    if (isMinimized) {
      try {
        prevHeightRef.current = height;
        setHeight(MINIMIZED_HEIGHT);
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("console_panel_height");
        const parsed = saved ? parseInt(saved, 10) : prevHeightRef.current || 320;
        const restore = Math.max(120, Math.min(window.innerHeight - 100, parsed));
        setHeight(restore);
      } catch (e) {
      }
      setIsMinimized(false);
    }
  }, [isOpen]);

  useEffect(() => {
    try {
      if (isOpen) {
        document.documentElement.style.setProperty("--console-height", `${height}px`);
      } else {
        document.documentElement.style.setProperty("--console-height", `0px`);
      }
    } catch (e) {
    }
    return () => {
      try {
        document.documentElement.style.setProperty("--console-height", `0px`);
      } catch (e) {}
    };
  }, [height, isOpen]);

  const onStartResize = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isMinimized) return; 
    resizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    const onMove = (ev: PointerEvent) => {
      if (!resizingRef.current) return;
      const dy = startYRef.current - ev.clientY; 
      const newHeight = Math.min(Math.max(120, startHeightRef.current + dy), Math.max(120, window.innerHeight - 80));
      setHeight(newHeight);
    };

    const onUp = () => {
      resizingRef.current = false;
      setIsResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    setIsResizing(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-[100]">
      <div
        className="relative bg-[#1e1e1e] border-t border-white/10 shadow-2xl"
        style={{ height, transition: isResizing ? "none" : "height 220ms cubic-bezier(.2,.8,.2,1)", willChange: "height" }}
      >
        {!isMinimized && (
          <div
            className="absolute left-0 right-0 h-3 -top-2 cursor-ns-resize"
            onPointerDown={onStartResize}
            aria-hidden
          />
        )}

        <div className="h-6 bg-[var(--bg-panel)] border-b border-neutral-700 flex items-center justify-between px-4 text-xs text-[var(--text-2)] relative">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.03)" }} />
          <h2 className="flex items-center gap-2 text-xs font-bold text-[var(--text-2)] relative z-10">
            <Terminal size={16} className="text-[var(--text-2)]" />
            <span className="leading-none">{t("menu.console")}</span>
          </h2>
          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => {
                if (!isMinimized) {
                  prevHeightRef.current = height;
                  try {
                    localStorage.setItem("console_panel_height", String(prevHeightRef.current));
                  } catch (e) {
                  }
                  setHeight(MINIMIZED_HEIGHT);
                  setIsMinimized(true);
                } else {
                  try {
                    const saved = localStorage.getItem("console_panel_height");
                    const parsed = saved ? parseInt(saved, 10) : prevHeightRef.current || 320;
                    const restore = Math.max(120, Math.min(window.innerHeight - 100, parsed));
                    setHeight(restore);
                  } catch (e) {
                    const restore = Math.max(120, Math.min(window.innerHeight - 100, prevHeightRef.current || 320));
                    setHeight(restore);
                  }
                  setIsMinimized(false);
                }
              }}
              className="p-1 transition-colors rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              aria-label={isMinimized ? "Restore console" : "Minimize console"}
            >
              {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <button onClick={onClose} className="p-1 transition-colors rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="h-full overflow-hidden bg-[var(--bg-main)] relative">
            <ConsoleConfig
              constraints={constraints}
              setConstraints={setConstraints}
              settings={settings}
              setSettings={setSettings}
              entries={entries}
              setEntries={setEntries}
              history={history}
              setHistory={setHistory}
              setProjectName={setProjectName}
              setProjectDescription={setProjectDescription}
              setProjectAuthor={setProjectAuthor}
              setIsSidebarOpen={setIsSidebarOpen}
              setView={setView}
              setJumpToTerm={setJumpToTerm}
              setDraftEntry={setDraftEntry}
              scriptConfig={scriptConfig}
              isScriptMode={isScriptMode}
              author={author}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleModal;
