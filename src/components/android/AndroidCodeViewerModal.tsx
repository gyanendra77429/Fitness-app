import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';
import { ANDROID_KOTLIN_FILES } from '../../data/androidKotlinCode';
import { vibrator } from '../../services/vibrator';

interface AndroidCodeViewerModalProps {
  onClose: () => void;
}

export const AndroidCodeViewerModal: React.FC<AndroidCodeViewerModalProps> = ({ onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = ANDROID_KOTLIN_FILES[selectedFileIdx];

  const handleCopy = () => {
    vibrator.repBuzz();
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="bg-[#15181e] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between bg-[#191d24]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Android Kotlin & Jetpack Architecture
              </h3>
              <p className="text-[11px] text-slate-400">
                Production-ready Kotlin, Room DB, SensorManager & Compose
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-black/40 border-b border-white/5 no-scrollbar">
          {ANDROID_KOTLIN_FILES.map((f, i) => (
            <button
              key={f.filename}
              onClick={() => {
                vibrator.repBuzz();
                setSelectedFileIdx(i);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
                selectedFileIdx === i
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>{f.filename}</span>
            </button>
          ))}
        </div>

        {/* File Metadata & Copy Bar */}
        <div className="px-4 py-2 bg-[#1b1f27] border-b border-white/5 flex items-center justify-between text-xs">
          <div className="text-slate-300 text-[11px] line-clamp-1 pr-2">
            💡 <strong>Purpose:</strong> {selectedFile.description}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
        </div>

        {/* Code Body */}
        <div className="flex-1 overflow-auto p-4 bg-[#0e1014] font-mono text-[11px] leading-relaxed text-slate-200 select-text">
          <pre className="whitespace-pre">
            <code>{selectedFile.code}</code>
          </pre>
        </div>

        {/* Footer Architecture Note */}
        <div className="p-3 bg-[#171a21] border-t border-white/8 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MVVM Architecture • StateFlow • Room Database • SensorManager</span>
          </div>
          <span className="text-indigo-400 font-mono font-bold">Jetpack Compose M3</span>
        </div>
      </div>
    </div>
  );
};
