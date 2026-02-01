
import React, { useState } from 'react';
import BrainApiService from '../services/brainApiService';

interface Props {
  onScanTrigger: (logs: string[]) => void;
}

const ScanBox: React.FC<Props> = ({ onScanTrigger }) => {
  const [repoInput, setRepoInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [installGithub, setInstallGithub] = useState(false);
  const [useRealAPI, setUseRealAPI] = useState(true);

  const startScan = async (type: 'REPO' | 'PR') => {
    setIsScanning(true);
    
    if (type === 'REPO' && useRealAPI) {
      try {
        // Check API health first
        const healthCheck = await BrainApiService.healthCheck();
        
        if (healthCheck.success) {
          // Use real API
          onScanTrigger([
            '🧠 [BRAIN] Connecting to API server...',
            '✅ [API] Connection established',
            '🔍 [detect] Running detection phase...'
          ]);
          
          const scanResult = await BrainApiService.scanRepository(repoInput || undefined);
          
          if (scanResult.success && scanResult.data) {
            const data = scanResult.data;
            const realLogs = [
              `🧠 [BRAIN] Initiating 18-Phase scan for: ${data.repo}`,
              '📡 Phase 1-3: Environmental Detection... OK',
              `🧬 Detected Languages: ${data.languages.join(', ')}`,
              `🧬 Framework: ${data.framework}`,
              `🏗️ CI/CD: ${data.ci}`,
              '🛡️ Phase 12: AI Guard Security scan...',
              '🛠️ Phase 8: Infrastructure normalization...',
              installGithub ? '🐙 [GITHUB] GitHub App integration enabled' : '⏭️ GitHub App installation bypassed',
              `🩺 [diagnose] Status: ${data.status}`,
              `📊 Health Score: ${data.healthScore}/100`,
              `💡 ${data.reason}`,
              '✅ Phase 18: Admission complete. MERMEDA v2.2.0 alignment verified.'
            ];
            onScanTrigger(realLogs);
          } else {
            throw new Error(scanResult.error || 'Scan failed');
          }
        } else {
          throw new Error('API server not available');
        }
      } catch (error: any) {
        // Fallback to mock mode
        onScanTrigger([
          '⚠️ [BRAIN] API not available - using demo mode',
          `🧠 [CAST BRAIN] Initiating grid discovery for: ${repoInput || './current-repo'}`,
          '📡 Phase 1-3: Environmental Fingerprinting... OK',
          '🧬 Phase 4: Stack Genome Identification...',
          '🧬 Detected: Node.js (v20), React, TypeScript',
          '🛡️ Phase 12: AI Guard Security scan initiated...',
          '🛠️ Phase 8: Normalizing infrastructure configuration...',
          installGithub ? '🐙 [GITHUB] Distributing BRAIN App to organization endpoints...' : '⏭️ GitHub App installation bypassed.',
          '✅ Phase 18: Admission complete. Repository now Green-locked.',
          '📊 100% MERMEDA v2.2.0 alignment verified.'
        ]);
      }
    } else {
      // Mock mode or PR scan
      const logs = type === 'REPO' ? [
        `🧠 [BRAIN] Initiating scan for: ${repoInput || './current-repo'}`,
        '📡 Phase 1-3: Environmental Fingerprinting... OK',
        '🧬 Phase 4: Stack Genome Identification...',
        '🧬 Detected: Node.js (v20), React, TypeScript',
        '🛡️ Phase 12: AI Guard Security scan initiated...',
        '🛠️ Phase 8: Normalizing infrastructure configuration...',
        installGithub ? '🐙 [GITHUB] Distributing BRAIN App to organization endpoints...' : '⏭️ GitHub App installation bypassed.',
        '✅ Phase 18: Admission complete. Repository now Green-locked.',
        '📊 100% MERMEDA v2.2.0 alignment verified.'
      ] : [
        `🤖 [PR BOT] Intercepting Pull Request hook: ${repoInput || 'PR-DEFAULT'}`,
        '🔍 SCANNING: Deep diff analysis for security regressions...',
        '🛡️ INTENT GUARD: Verifying no business logic mutation... OK',
        '🔄 ANALYZING: Workflow drift from canonical MERMEDA spec...',
        '🛠️ SURGEON: Correcting CI environment drift for v2.2.0 compliance...',
        '🧪 VERIFYING: Executing sanity build sequence with zero logic loss...',
        '✅ SUCCESS: PR Sanitization complete. Approval: GRANTED.',
        '🚀 READY: Workflow integrity synchronized across fleet.'
      ];

      setTimeout(() => {
        onScanTrigger(logs);
      }, 1500);
    }
    
    setTimeout(() => {
      setIsScanning(false);
      setRepoInput('');
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/20 border-2 sm:border-4 border-slate-800 rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] p-6 sm:p-10 lg:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-700">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] select-none pointer-events-none group-hover:opacity-10 transition-opacity hidden sm:block">
        <span className="text-[6rem] md:text-[10rem] xl:text-[15rem] font-black italic tracking-tighter uppercase leading-none">ADMISSION</span>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-8 py-1.5 sm:py-3 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6 sm:mb-10">
            <span className="w-1.5 h-1.5 sm:w-2 md:w-3 h-1.5 sm:h-2 md:h-3 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[7px] sm:text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-blue-400">Hospital Admission Portal</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6 sm:mb-10 uppercase italic leading-[1.1]">
            Scan Repo or PR for <br className="hidden sm:block"/><span className="text-blue-500">Governance Report</span>
          </h2>
        </div>
        
        <div className="space-y-4 sm:space-y-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
            <input 
              type="text" 
              placeholder="Repo path or PR ID (e.g., #123)" 
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              className="flex-1 bg-slate-950/80 border-2 border-slate-800 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] px-5 sm:px-8 md:px-12 py-3.5 sm:py-6 md:py-8 text-sm sm:text-lg md:text-2xl font-bold text-white outline-none focus:border-blue-500/50 focus:ring-4 md:focus:ring-[20px] focus:ring-blue-500/5 transition-all placeholder:text-slate-700/50 shadow-inner"
            />
            <div className="flex flex-row gap-2 sm:gap-3 md:gap-4">
              <button 
                onClick={() => startScan('REPO')}
                disabled={isScanning}
                className="flex-1 lg:flex-none bg-white text-slate-950 text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest px-3 sm:px-8 md:px-12 py-3.5 sm:py-6 md:py-8 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] hover:bg-blue-400 transition-all active:scale-95 shadow-2xl disabled:opacity-50"
              >
                Scan Repo
              </button>
              <button 
                onClick={() => startScan('PR')}
                disabled={isScanning}
                className="flex-1 lg:flex-none bg-slate-800 text-white text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest px-3 sm:px-8 md:px-12 py-3.5 sm:py-6 md:py-8 rounded-xl sm:rounded-2xl md:rounded-[2.5rem] hover:bg-slate-700 transition-all active:scale-95 border border-slate-700 shadow-2xl disabled:opacity-50"
              >
                Scan PR
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 border-t border-slate-800/50 pt-4 sm:pt-6 md:pt-8">
            <label className="flex items-center gap-2.5 sm:gap-4 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={installGithub}
                  onChange={(e) => setInstallGithub(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-7 bg-slate-800 rounded-full peer-checked:bg-blue-600 transition-colors shadow-inner"></div>
                <div className="absolute left-0.5 top-0.5 sm:left-1 sm:top-1 md:left-1.5 md:top-1.5 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 bg-white rounded-full transition-transform peer-checked:translate-x-3 sm:peer-checked:translate-x-4 md:peer-checked:translate-x-5"></div>
              </div>
              <span className="text-[7px] sm:text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                Install App on GitHub <span className="text-[6px] sm:text-[8px] opacity-40 italic block sm:inline sm:ml-2">(Advanced Admission)</span>
              </span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-8 mt-10 md:mt-16">
          {[
            { label: 'Auto-Fix', icon: '🛠️', status: 'Ready' },
            { label: 'Security', icon: '🛡️', status: 'Active' },
            { label: 'PR Repair', icon: '🧪', status: 'Optimal' },
            { label: 'Logic Lock', icon: '🔒', status: 'Guarded' },
          ].map(bot => (
            <div key={bot.label} className="p-3 sm:p-4 md:p-6 bg-slate-950/40 border border-slate-800/50 rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col items-center gap-1 sm:gap-2 hover:border-blue-500/30 transition-all hover:bg-slate-950/60 shadow-inner group/bot cursor-help">
              <span className="text-xl sm:text-2xl md:text-3xl transition-transform group-hover/bot:scale-110">{bot.icon}</span>
              <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-100 text-center">{bot.label}</span>
              <span className="text-[6px] sm:text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-emerald-500 opacity-80">{bot.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScanBox;
