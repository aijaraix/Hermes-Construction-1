import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Layers, CheckCircle2, ShieldCheck, Database, Search } from 'lucide-react';

export const KnowledgeCenterView: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [chunks, setChunks] = useState<any[]>([]);
  const [assertions, setAssertions] = useState<any[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'documents' | 'chunks' | 'assertions' | 'gaps'>('sources');

  useEffect(() => {
    const fetchKnowledgeData = async () => {
      try {
        const [srcRes, docRes, chkRes, assRes, gapRes] = await Promise.all([
          fetch('/api/knowledge/sources').catch(() => null),
          fetch('/api/knowledge/documents').catch(() => null),
          fetch('/api/knowledge/chunks').catch(() => null),
          fetch('/api/knowledge/assertions').catch(() => null),
          fetch('/api/knowledge/gaps').catch(() => null),
        ]);

        if (srcRes && srcRes.ok) setSources((await srcRes.json().catch(() => [])) || []);
        if (docRes && docRes.ok) setDocuments((await docRes.json().catch(() => [])) || []);
        if (chkRes && chkRes.ok) setChunks((await chkRes.json().catch(() => [])) || []);
        if (assRes && assRes.ok) setAssertions((await assRes.json().catch(() => [])) || []);
        if (gapRes && gapRes.ok) setGaps((await gapRes.json().catch(() => [])) || []);
      } catch {
        // Handle gracefully
      }
    };

    fetchKnowledgeData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">KNOWLEDGE CENTER</h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                AUTHORITATIVE CORPUS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Consolidated Repository of Authoritative Building Codes, Structural Specifications, Extracted Chunks & Provenance Graph
            </p>
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'sources', label: `Sources (${sources.length})` },
              { id: 'documents', label: `Docs (${documents.length})` },
              { id: 'chunks', label: `Chunks (${chunks.length})` },
              { id: 'assertions', label: `Rules (${assertions.length})` },
              { id: 'gaps', label: `Gaps (${gaps.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition font-bold ${
                  activeTab === tab.id ? 'bg-cyan-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Panels */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {sources.map((src, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">{src.sourceId}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    {src.status || 'VERIFIED'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 font-sans">{src.title}</h4>
                <p className="text-[11px] text-slate-400">{src.publisher} • Tier {src.hierarchyTier}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chunks' && (
          <div className="space-y-3 font-mono text-xs">
            {chunks.map((chk, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">{chk.chunkId}</span>
                  <span className="text-slate-500">Page {chk.pageNumber}</span>
                </div>
                <p className="text-slate-200 font-sans leading-relaxed text-xs">{chk.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
