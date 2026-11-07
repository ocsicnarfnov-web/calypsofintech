import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Cloud, Copy, Check, ExternalLink, Terminal, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RenderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenderDeployModal: React.FC<RenderDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deploy Calypso to Render (render.com)"
      subtitle="Production deployment blueprint configured for Render Web Service or Static Site"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-neutral-600 dark:text-neutral-300">
        {/* Status Alert */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-100 block">
                Render Ready · Configuration Injected
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                <code>render.yaml</code>, <code>server.js</code>, and <code>package.json</code> start script are configured.
              </span>
            </div>
          </div>

          <a
            href="https://dashboard.render.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            <span>Open Render Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Option A: Web Service */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
                Option 1: Deploy as Render Web Service (Recommended)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              Node.js + Express
            </span>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Runs the full application with the production Express server, health probes, and client-side SPA routing.
          </p>

          <div className="space-y-2 font-mono text-xs">
            {/* Build Command */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
              <div>
                <span className="text-[11px] text-neutral-400 block font-sans">Build Command:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  npm install --legacy-peer-deps && npm run build
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('build', 'npm install --legacy-peer-deps && npm run build')}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded"
                title="Copy build command"
              >
                {copiedKey === 'build' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Start Command */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
              <div>
                <span className="text-[11px] text-neutral-400 block font-sans">Start Command:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  npm start
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('start', 'npm start')}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded"
                title="Copy start command"
              >
                {copiedKey === 'start' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Health Check Path */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
              <div>
                <span className="text-[11px] text-neutral-400 block font-sans">Health Check Path:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  /api/health
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('health', '/api/health')}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded"
                title="Copy health check path"
              >
                {copiedKey === 'health' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Option B: Static Site */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
                Option 2: Deploy as Render Static Site (Free Tier)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              Pure CDN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[11px] text-neutral-400 block font-sans">Build Command:</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold block mt-0.5">
                npm run build
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-[11px] text-neutral-400 block font-sans">Publish Directory:</span>
              <span className="text-neutral-900 dark:text-neutral-100 font-semibold block mt-0.5">
                dist
              </span>
            </div>
          </div>
        </div>

        {/* 3 Step Deployment Instructions */}
        <div className="p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2 text-xs">
          <span className="font-bold text-neutral-900 dark:text-neutral-100 block font-sans uppercase tracking-wider">
            How to Deploy in 3 Steps
          </span>
          <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 dark:text-neutral-300">
            <li>
              Push this codebase to your <strong>GitHub</strong> or <strong>GitLab</strong> repository.
            </li>
            <li>
              Log into <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="underline font-semibold">Render Dashboard</a> and click <strong>"New +"</strong> &rarr; <strong>"Blueprint"</strong> (or "Web Service").
            </li>
            <li>
              Select your repository. Render automatically reads <code>render.yaml</code> and starts building immediately!
            </li>
          </ol>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
