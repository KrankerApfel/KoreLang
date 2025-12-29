import React, { useState } from 'react';
import { Wand2, RefreshCw, Volume2, Info, LayoutGrid, EyeOff, ShieldAlert, Plus, Trash2, X, Check, Eye, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { generatePhonology, isApiKeySet } from '../services/geminiService';
import { PhonologyConfig, Phoneme } from '../types';
import { useTranslation } from '../i18n';
import { Card, Section, ViewLayout, FormField, ActionButton, CompactButton, Modal, SearchInput } from './ui';
import PhonemeGrid from './PhonemeGrid';

interface PhonologyEditorProps {
    data: PhonologyConfig;
    setData: (data: PhonologyConfig) => void;
    enableAI: boolean; // NEW PROP
}

const MANNERS = ['plosive', 'nasal', 'trill', 'tap', 'fricative', 'lateral-fricative', 'approximant', 'lateral-approximant'];
const PLACES = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'retroflex', 'palatal', 'velar', 'uvular', 'pharyngeal', 'glottal'];
const HEIGHTS = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open'];
const BACKNESS = ['front', 'central', 'back'];

const PhonologyEditor: React.FC<PhonologyEditorProps> = ({ data, setData, enableAI }) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [pendingPhonology, setPendingPhonology] = useState<PhonologyConfig | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
    const [editingPhoneme, setEditingPhoneme] = useState<{ type: 'consonant' | 'vowel', manner?: string, place?: string, height?: string, backness?: string } | null>(null);
    const [symbol, setSymbol] = useState('');
    const [voiced, setVoiced] = useState(false);
    const [rounded, setRounded] = useState(false);

    // Classified vs unclassified phonemes (useful when AI returns symbols without full features)
    const classifiedConsonants = (data.consonants || []).filter(p => p.manner && p.place);
    const unclassifiedConsonants = (data.consonants || []).filter(p => !(p.manner && p.place));

    const classifiedVowels = (data.vowels || []).filter(v => v.height && v.backness);
    const unclassifiedVowels = (data.vowels || []).filter(v => !(v.height && v.backness));

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        try {
            const result = await generatePhonology(prompt);
            console.log('AI generatePhonology result:', result);
            setPendingPhonology(result);
            setShowPreview(true);
            setIsPreviewMinimized(false);
        } catch (e) {
            alert(t('phonology.generation_failed'));
        }
        setLoading(false);
    };

    const confirmReplace = () => {
        if (!pendingPhonology) return;
        // Check if there was previous phonology to warn user
        const hasPrevious = data.consonants.length > 0 || data.vowels.length > 0;
        if (hasPrevious) {
            if (!confirm(t('phonology.replace_confirm'))) return;
        }
        setData(pendingPhonology);
        setPendingPhonology(null);
        setShowPreview(false);
    };

    const discardPending = () => {
        setPendingPhonology(null);
        setShowPreview(false);
    };

    const handleSavePhoneme = () => {
        if (!symbol || !editingPhoneme) return;

        const newPhoneme: Phoneme = {
            symbol,
            type: editingPhoneme.type,
            ...(editingPhoneme.type === 'consonant' ? { manner: editingPhoneme.manner, place: editingPhoneme.place, voiced } : { height: editingPhoneme.height, backness: editingPhoneme.backness, rounded })
        };

        const listKey = editingPhoneme.type === 'consonant' ? 'consonants' : 'vowels';
        const updatedList = [...(data[listKey] || [])];

        // Remove existing phoneme with same symbol or in same cell if we want unique symbols
        // For now, let's just add it.
        updatedList.push(newPhoneme);

        setData({
            ...data,
            [listKey]: updatedList
        });
        setEditingPhoneme(null);
        setSymbol('');
    };

    const handleRemovePhoneme = (phoneme: Phoneme, type: 'consonant' | 'vowel') => {
        const listKey = type === 'consonant' ? 'consonants' : 'vowels';
        const currentList = data[listKey] || [];
        const idx = currentList.indexOf(phoneme);
        if (idx < 0) return;
        const updatedList = [...currentList];
        updatedList.splice(idx, 1);
        setData({ ...data, [listKey]: updatedList });
    };

    const clearAll = () => {
        if (confirm(t('phonology.clear_confirm'))) {
            setData({ ...data, consonants: [], vowels: [] });
        }
    };

    // Helper to find phoneme in specific cell using normalized matching
    const normalize = (s?: string) => (s || '').toString().toLowerCase().trim();

    const getConsonants = (manner: string, place: string) => {
        const nm = normalize(manner);
        const np = normalize(place);
        return classifiedConsonants.filter(p => normalize(p.manner) === nm && normalize(p.place) === np);
    };

    const getVowels = (height: string, backness: string) => {
        const nh = normalize(height);
        const nb = normalize(backness);
        return classifiedVowels.filter(p => normalize(p.height) === nh && normalize(p.backness) === nb);
    };

    const headerActions = enableAI ? (
        <div className="flex items-center gap-3">
            <CompactButton
                onClick={() => setShowAIModal(true)}
                icon={<Wand2 size={14} />}
                label={t('phonology.generate_btn')}
                color="var(--primary)"
            />
            {pendingPhonology && (
                <CompactButton
                    onClick={() => setShowPreview(!showPreview)}
                    icon={<Eye size={14} />}
                    label={showPreview ? t('phonology.hide_preview') : t('phonology.show_preview')}
                />
            )}
        </div>
    ) : null;

    return (
        <ViewLayout
            icon={Volume2}
            title={t('phonology.title')}
            subtitle={t('phonology.subtitle')}
            headerChildren={headerActions}
        >
            <div className="flex h-full gap-6 p-6 overflow-hidden">

            {/* Left Panel: Controls */}
            <div className="w-80 flex flex-col gap-6 shrink-0">
                <Card className="p-5 flex-1 overflow-y-auto">
                    <Section title={t('phonology.stats')} icon={<Info size={20} />} className="mb-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 px-3 rounded" style={{ backgroundColor: 'var(--surface)' }}>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('phonology.inventory')}</span>
                                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{(data.consonants?.length || 0) + (data.vowels?.length || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 rounded" style={{ backgroundColor: 'var(--surface)' }}>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('phonology.consonants')}</span>
                                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.consonants?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 rounded" style={{ backgroundColor: 'var(--surface)' }}>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('phonology.vowels')}</span>
                                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{data.vowels?.length || 0}</span>
                            </div>
                            <FormField label={t('phonology.syllable_struct')}>
                                <input
                                    value={data.syllableStructure || ''}
                                    onChange={(e) => setData({ ...data, syllableStructure: e.target.value })}
                                    placeholder={t('phonology.syllable_placeholder')}
                                    className="w-full px-3 py-2 rounded font-mono text-sm border outline-none focus:ring-2 transition-all"
                                    style={{ 
                                        backgroundColor: 'var(--surface)', 
                                        borderColor: 'var(--border)',
                                        color: 'var(--text-primary)',
                                        '--tw-ring-color': 'var(--accent)'
                                    } as React.CSSProperties}
                                />
                            </FormField>
                            <ActionButton
                                onClick={clearAll}
                                icon={<Trash2 size={16} />}
                                title={t('phonology.clear_inventory')}
                                className="bg-red-900/20 border-red-900/30 hover:border-red-700"
                            />
                        </div>
                    </Section>
                </Card>
            </div>

            {/* Right Panel: Charts */}
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">

                {/* Consonants Chart */}
                <PhonemeGrid
                    title={t('phonology.consonants')}
                    icon={<LayoutGrid size={20} />}
                    isVowels={false}
                    getPhonemes={(manner, place) => getConsonants(manner, place)}
                    onCellClick={(manner, place) => {
                        setEditingPhoneme({ type: 'consonant', manner, place });
                        setVoiced(false);
                        setSymbol('');
                    }}
                    onRemove={(phoneme) => handleRemovePhoneme(phoneme, 'consonant')}
                    renderPhoneme={(p) => (
                        <span
                            title={`${p.voiced ? 'Voiced' : 'Unvoiced'} ${p.place} ${p.manner}`}
                            className={`text-lg font-serif ${p.voiced ? 'text-neutral-200' : 'text-neutral-400'}`}
                        >
                            {p.symbol}
                        </span>
                    )}
                    minWidth={800}
                    unclassified={{
                        items: unclassifiedConsonants,
                        titleKey: 'phonology.unclassified_consonants',
                        position: 'top',
                    }}
                />

                {/* Vowels Chart */}
                <PhonemeGrid
                    title={t('phonology.vowels')}
                    icon={<Volume2 size={20} />}
                    isVowels={true}
                    getPhonemes={(height, back) => getVowels(height, back)}
                    onCellClick={(height, backness) => {
                        setEditingPhoneme({ type: 'vowel', height, backness });
                        setRounded(false);
                        setSymbol('');
                    }}
                    onRemove={(phoneme) => handleRemovePhoneme(phoneme, 'vowel')}
                    renderPhoneme={(v) => (
                        <span
                            className="text-lg font-serif"
                            style={{ color: v.rounded ? 'var(--accent)' : 'var(--primary)' }}
                            title={`${v.height} ${v.backness} ${v.rounded ? 'rounded' : 'unrounded'}`}
                        >
                            {v.symbol}
                        </span>
                    )}
                    minWidth={520}
                    legend={(
                        <div className="flex justify-center gap-4">
                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span> {t('phonology.unrounded')}</span>
                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></span> {t('phonology.rounded')}</span>
                        </div>
                    )}
                    unclassified={{
                        items: unclassifiedVowels,
                        titleKey: 'phonology.unclassified_vowels',
                        position: 'bottom',
                        renderItem: (v, i) => (
                            <span key={`unvow-${i}`} className="px-2 py-1 bg-neutral-800 rounded font-serif text-xl border border-neutral-700" style={{ color: 'var(--text-primary)' }}>
                                {v.symbol}
                            </span>
                        ),
                    }}
                />

            </div>

            {/* Phoneme Editor Modal */}
            {editingPhoneme && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                            <h3 className="text-md font-bold text-neutral-100 flex items-center gap-2 capitalize">
                                <Plus size={16} className="text-blue-500" />
                                {editingPhoneme.type === 'consonant' ? t('phonology.add_consonant') : t('phonology.add_vowel')}
                            </h3>
                            <button onClick={() => setEditingPhoneme(null)} className="text-neutral-500 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-xs text-neutral-500 uppercase font-bold text-center">
                                {editingPhoneme.type === 'consonant'
                                    ? `${t(`phonology.place.${editingPhoneme.place}`)} ${t(`phonology.manner.${editingPhoneme.manner}`)}`
                                    : `${t(`phonology.height.${editingPhoneme.height}`)} ${t(`phonology.backness.${editingPhoneme.backness}`)}`
                                }
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-400 uppercase">{t('phonology.symbol_label')}</label>
                                <input
                                    autoFocus
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSavePhoneme()}
                                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 font-serif text-2xl text-center focus:border-blue-500 outline-none"
                                    style={{ color: 'var(--text-tertiary)' }}
                                    placeholder={t('phonology.symbol_placeholder')}
                                />
                            </div>
                            {editingPhoneme.type === 'consonant' ? (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={voiced}
                                        onChange={(e) => setVoiced(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${voiced ? 'bg-blue-600' : 'bg-neutral-700'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${voiced ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <span className="text-sm text-neutral-300">{t('phonology.voiced')}</span>
                                </label>
                            ) : (
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={rounded}
                                        onChange={(e) => setRounded(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors relative ${rounded ? 'bg-amber-600' : 'bg-neutral-700'}`}>
                                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${rounded ? 'translate-x-4' : ''}`} />
                                    </div>
                                    <span className="text-sm text-neutral-300">{t('phonology.rounded')}</span>
                                </label>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-3">
                            <button onClick={() => setEditingPhoneme(null)} className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.cancel')}</button>
                            <button
                                onClick={handleSavePhoneme}
                                disabled={!symbol}
                                className="px-4 py-2 disabled:opacity-50 text-sm font-bold rounded flex items-center gap-2"
                                style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
                            >
                                <Check size={16} /> {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Preview Floating Panel */}
            {pendingPhonology && showPreview && (
                <div className={`fixed bottom-10 right-10 z-[80] transition-all duration-300 ${isPreviewMinimized ? 'w-48 h-12' : 'w-96 h-[500px]'} bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5`}>
                    <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex justify-between items-center cursor-pointer" onClick={() => setIsPreviewMinimized(!isPreviewMinimized)}>
                        <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
                            <Wand2 size={14} className="text-purple-400" />
                            {t('phonology.ai_review')}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setIsPreviewMinimized(!isPreviewMinimized); }} className="text-neutral-500 hover:text-white">
                                {isPreviewMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setShowPreview(false); }} className="text-neutral-500 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isPreviewMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-neutral-500 uppercase">{t('phonology.syllable_struct')}</div>
                                    <div className="text-emerald-400 font-mono text-sm bg-neutral-950 p-2 rounded border border-neutral-800">
                                        {pendingPhonology.syllableStructure || 'None'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-neutral-500 uppercase">{t('phonology.consonants')} ({pendingPhonology.consonants.length})</div>
                                    <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-950 rounded border border-neutral-800 min-h-[50px]">
                                        {pendingPhonology.consonants.map((p, i) => (
                                            <span key={i} className="text-lg font-serif text-neutral-200 w-8 h-8 flex items-center justify-center bg-neutral-900 rounded" title={`${p.place} ${p.manner}`}>
                                                {p.symbol}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-neutral-500 uppercase">{t('phonology.vowels')} ({pendingPhonology.vowels.length})</div>
                                    <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-950 rounded border border-neutral-800 min-h-[50px]">
                                        {pendingPhonology.vowels.map((v, i) => (
                                            <span key={i} className={`text-xl font-serif w-8 h-8 flex items-center justify-center bg-neutral-900 rounded ${v.rounded ? 'text-amber-400' : 'text-blue-300'}`} title={`${v.height} ${v.backness}`}>
                                                {v.symbol}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {pendingPhonology.bannedCombinations.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-neutral-500 uppercase">{t('phonology.banned_combinations')}</div>
                                        <div className="text-xs text-red-400 p-2 bg-neutral-950 rounded border border-neutral-800">
                                            {pendingPhonology.bannedCombinations.join(', ')}
                                        </div>
                                    </div>
                                )}

                                <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg flex items-start gap-3">
                                    <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-blue-200 leading-relaxed">
                                        {t('phonology.replace_warning')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex gap-2">
                                <button
                                    onClick={discardPending}
                                    className="flex-1 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                                >
                                    {t('phonology.discard')}
                                </button>
                                <button
                                    onClick={confirmReplace}
                                    className="flex-[2] py-2 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--text-primary)' }}
                                >
                                    <Check size={14} /> {t('phonology.apply_replace')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* AI Generator Modal */}
            {enableAI && (
                <Modal
                    isOpen={showAIModal}
                    onClose={() => setShowAIModal(false)}
                    title={t('phonology.ai_generator')}
                    icon={<Wand2 size={18} />}
                    maxWidth="max-w-md"
                    footer={(
                        <>
                            <button
                                onClick={() => setShowAIModal(false)}
                                className="px-4 py-2 text-sm font-medium transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {t('common.cancel')}
                            </button>
                            <CompactButton
                                onClick={() => {
                                    handleGenerate();
                                    setShowAIModal(false);
                                }}
                                icon={loading ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                                label={loading ? t('phonology.analyze_btn') : t('phonology.generate_btn')}
                                disabled={loading || !prompt}
                                color="var(--primary)"
                            />
                        </>
                    )}
                >
                    <FormField label={t('phonology.vibe_label')}>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('phonology.vibe_placeholder')}
                            autoFocus
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 outline-none resize-none"
                            style={{ 
                                backgroundColor: 'var(--surface)', 
                                borderColor: 'var(--border)', 
                                color: 'var(--text-primary)',
                                '--tw-ring-color': 'var(--accent)',
                                minHeight: '8rem'
                            } as React.CSSProperties}
                            rows={4}
                        />
                    </FormField>
                    {!isApiKeySet() && (
                        <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded-lg text-xs text-amber-200 flex items-start gap-3">
                            <ShieldAlert size={14} className="shrink-0 text-amber-500" />
                            <div>
                                {t('console.ai_failed_no_key')} <a href="https://github.com/zRinexD/KoreLang/" target="_blank" rel="noopener noreferrer" className="underline font-bold">{t('menu.docs')}</a>.
                            </div>
                        </div>
                    )}
                </Modal>
            )}
            </div>
        </ViewLayout>
    );
};

export default PhonologyEditor;