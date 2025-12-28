import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Cpu, Palette, Download, Upload, Check, Eye, EyeOff, HelpCircle, ExternalLink, ChevronLeft } from 'lucide-react';
import { useTranslation, languages } from '../i18n';
import { useUI } from '../ui/UIContext';
import { AppSettings } from '../types';
import { DEFAULT_CUSTOM } from '../constants';
import { isApiKeySet, getApiKey } from '../services/geminiService';
import { useCommandExecutor } from '../state/commandStore';

// Presets de thèmes pour copie dans custom
const THEME_PRESETS = {
  dark: {
    primary: "#6B8AFF",
    secondary: "#0A0A0A",
    accent: "#3B82F6",
    background: "#121212",
    surface: "#1E1E1E",
    elevated: "#2A2A2A",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textTertiary: "#64748B",
    border: "#2A2A2A",
    divider: "#1E1E1E",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    hover: "#5B7BFF",
    active: "#4B6BEF",
    disabled: "#404040",
  },
  cappuccino: {
    primary: "#CC9B7A",
    secondary: "#191918",
    accent: "#D97757",
    background: "#F4F1ED",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    textPrimary: "#191918",
    textSecondary: "#5C5C5A",
    textTertiary: "#8E8E8C",
    border: "#E6E3DE",
    divider: "#D4CFC7",
    success: "#2D9F7C",
    warning: "#E89C3F",
    error: "#D14343",
    info: "#5B8DBE",
    hover: "#B88762",
    active: "#A67756",
    disabled: "#BFBBB5",
  },
  "tokyo-night": {
    primary: "#7AA2F7",
    secondary: "#16161E",
    accent: "#7AA2F7",
    background: "#1A1B26",
    surface: "#24283B",
    elevated: "#414868",
    textPrimary: "#A9B1D6",
    textSecondary: "#565F89",
    textTertiary: "#3B4261",
    border: "#292E42",
    divider: "#1F2335",
    success: "#9ECE6A",
    warning: "#E0AF68",
    error: "#F7768E",
    info: "#7AA2F7",
    hover: "#5B7FD7",
    active: "#4B6FC7",
    disabled: "#3B4261",
  },
};

interface SettingsModalProps {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, updateSettings }) => {
  const ui = useUI();
  
  if (!ui.isOpen('settings')) return null;

  const { t, i18n } = useTranslation();
  const executeCommand = useCommandExecutor();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'THEME'>('GENERAL');
  const [apiKey, setApiKeyLocal] = useState(getApiKey());
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(settings.theme);
  const hasApiKey = isApiKeySet();

  useEffect(() => {
    setCurrentTheme(settings.theme);
  }, [settings.theme]);

  const setLanguage = (lang: string) => executeCommand('setLanguage', { language: lang });

  const handleCustomUpdate = (key: keyof typeof DEFAULT_CUSTOM, val: string) => {
    executeCommand('updateCustomTheme', { colorKey: key, colorValue: val });
  };

  const setTheme = (theme: 'dark' | 'cappuccino' | 'tokyo-night' | 'custom') => {
    setCurrentTheme(theme);
    // Copier les couleurs du preset dans customTheme pour permettre la dérivation
    const presetColors = THEME_PRESETS[theme as keyof typeof THEME_PRESETS];
    if (presetColors) {
      executeCommand('setTheme', { theme, customTheme: presetColors as any });
    } else {
      executeCommand('setTheme', { theme, customTheme: settings.customTheme as any });
    }
  };

  const exportTheme = () => {
    const theme = settings.customTheme || DEFAULT_CUSTOM;
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cs-theme-custom.json`;
    a.click();
  };

  const importTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        executeCommand('setTheme', { theme: 'custom', customTheme: imported as any });
      } catch {
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
  };

  const handleApiKeyChange = (val: string) => {
    setApiKeyLocal(val);
    executeCommand('setApiKey', { apiKey: val });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800" style={{ backgroundColor: 'var(--elevated)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.preferences_title')}</h2>
          <button onClick={() => ui.close('settings')} className="text-slate-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex text-sm border-b border-slate-800 bg-slate-900">
          <button onClick={() => setActiveTab('GENERAL')} className={`px-6 py-2 font-bold ${activeTab === 'GENERAL' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>{t('settings.tab_general')}</button>
          <button onClick={() => setActiveTab('THEME')} className={`px-6 py-2 font-bold ${activeTab === 'THEME' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>{t('settings.tab_visual')}</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'GENERAL' ? (
            <>
              {/* AI toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-900/10 border-blue-900/30">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200"><Cpu size={16} className="text-purple-400" /> {t('settings.cognitive_ai')}</div>
                  <p className="text-[10px] text-slate-400">{t('settings.cognitive_ai_desc')}</p>
                </div>
                <input type="checkbox" checked={settings.enableAI} onChange={(e) => executeCommand('setAIEnabled', { aiEnabled: e.target.checked })} className="w-5 h-5 rounded" />
              </div>

              {/* API key */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">{t('settings.api_key')}</label>
                <div className="relative">
                  <input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={(e) => handleApiKeyChange(e.target.value)} className="w-full px-3 py-2 pr-10 text-sm transition-colors border rounded outline-none bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500" placeholder={t('settings.api_key_ph')} />
                  <button onClick={() => setShowApiKey(!showApiKey)} className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-500 hover:text-slate-300">
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block mb-3 text-xs font-bold uppercase text-slate-500">{t('settings.language_label')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-2 rounded max-h-[200px] overflow-y-auto custom-scrollbar">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`py-1.5 px-2 text-[10px] font-medium rounded truncate transition-all ${i18n.language === lang.code ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-y-[-1px]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`} title={lang.label}>{lang.label}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Theme presets */}
              <div>
                <label className="block mb-3 text-xs font-bold uppercase text-slate-500">{t('settings.theme_presets') || 'Préréglages globaux'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['dark', 'cappuccino', 'tokyo-night'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTheme(preset as any)}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all uppercase ${
                        currentTheme === preset
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {preset.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom theme section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                    <Palette size={16} /> {t('settings.custom_theme') || 'Branding personnalisé'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={exportTheme}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                      title={t('settings.export_json') || 'Exporter le thème'}
                    >
                      <Download size={14} />
                    </button>
                    <label className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer" title={t('settings.import_json') || 'Importer un thème'}>
                      <Upload size={14} />
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTheme}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  {[
                    { key: 'primary', label: t('settings.primary_color') || 'Couleur primaire' },
                    { key: 'secondary', label: t('settings.secondary_color') || 'Couleur secondaire' },
                    { key: 'accent', label: t('settings.accent_color') || 'Couleur d\'accent' },
                    { key: 'background', label: t('settings.background') || 'Arrière-plan principal' },
                    { key: 'surface', label: t('settings.surface') || 'Surface / Panneaux' },
                    { key: 'elevated', label: t('settings.elevated') || 'Élevé / En-têtes' },
                    { key: 'textPrimary', label: t('settings.text_primary') || 'Texte principal' },
                    { key: 'textSecondary', label: t('settings.text_secondary') || 'Texte secondaire' },
                    { key: 'textTertiary', label: t('settings.text_tertiary') || 'Texte tertiaire' },
                    { key: 'border', label: t('settings.border') || 'Bordures' },
                    { key: 'divider', label: t('settings.divider') || 'Séparateurs' },
                    { key: 'success', label: t('settings.success') || 'Succès' },
                    { key: 'warning', label: t('settings.warning') || 'Avertissement' },
                    { key: 'error', label: t('settings.error') || 'Erreur' },
                    { key: 'info', label: t('settings.info') || 'Information' },
                    { key: 'hover', label: t('settings.hover') || 'Survol' },
                    { key: 'active', label: t('settings.active') || 'Actif' },
                    { key: 'disabled', label: t('settings.disabled') || 'Désactivé' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-300 flex-1">{label}</label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono min-w-[60px] text-right">
                          {settings.customTheme?.[key as keyof typeof DEFAULT_CUSTOM] || DEFAULT_CUSTOM[key as keyof typeof DEFAULT_CUSTOM]}
                        </span>
                        <div className="relative w-10 h-10 rounded overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-colors">
                          <input
                            type="color"
                            value={settings.customTheme?.[key as keyof typeof DEFAULT_CUSTOM] || DEFAULT_CUSTOM[key as keyof typeof DEFAULT_CUSTOM]}
                            onChange={(e) => handleCustomUpdate(key as keyof typeof DEFAULT_CUSTOM, e.target.value)}
                            className="absolute cursor-pointer border-0 outline-none"
                            style={{ 
                              width: '200%', 
                              height: '200%', 
                              top: '-50%', 
                              left: '-50%',
                              padding: 0,
                              margin: 0
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {currentTheme === 'custom' && (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    <Check size={10} /> {t('settings.active_theme') || 'Thème actif'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800" style={{ backgroundColor: 'var(--elevated)' }}>
          <button onClick={() => ui.close('settings')} className="px-4 py-2 text-sm font-bold rounded shadow-lg" style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
