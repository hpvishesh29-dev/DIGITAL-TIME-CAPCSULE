import React, { useState } from 'react';
import { X, Download, CheckCircle, Sparkles, FolderArchive } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { exportProjectZip } from '../../utils/zipExporter';
import { soundEngine } from '../../utils/audio';

export const ZipDownloadModal = () => {
  const { isZipModalOpen, setIsZipModalOpen } = useMemory();
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isZipModalOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    soundEngine.playGlassHover();
    try {
      await exportProjectZip();
      setDownloaded(true);
      soundEngine.playSealSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fadeIn">
      
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/35 shadow-2xl">
        
        <button
          onClick={() => {
            setIsZipModalOpen(false);
            soundEngine.playGlassHover();
          }}
          className="absolute top-5 right-5 glass-button p-2.5 rounded-full text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/35">
            <FolderArchive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white text-glow-cyan">
              Download Source Code
            </h2>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              Complete Production-Ready React + Three.js Repository
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs font-mono text-gray-300 mb-6">
          <div className="flex items-center justify-between text-purple-300 font-semibold border-b border-white/10 pb-2.5 mb-1">
            <span>CHRONA PACKAGE INCLUDES:</span>
            <span className="text-cyan-400">v1.0.0</span>
          </div>
          {[
            "React + Vite + Tailwind CSS Setup",
            "Three.js PBR Glass Sphere & Starfield",
            "Web Audio Ambient Synthesizer Engine",
            "Firebase SDK Firestore Sync Layer",
            "Chrona AI Assistant & Vault View",
            "GSAP Animations & Postprocessing",
          ].map((item, i) => (
            <p key={i} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>{item}</span>
            </p>
          ))}
        </div>

        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-display font-semibold text-sm shadow-neon-cyan hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Generating ZIP Archive...</span>
            </>
          ) : downloaded ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span>Downloaded! Click to Download Again</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download CHRONA-Digital-Time-Capsule.zip</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};
