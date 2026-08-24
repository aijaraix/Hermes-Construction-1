import React, { useState } from 'react';
import { BOMItem } from '../types/hermes';
import { DollarSign, ShieldCheck, Truck, CheckCircle, Search, Layers, ExternalLink } from 'lucide-react';

interface BOMViewProps {
  bom: BOMItem[];
  onHighlightComponents?: (componentIds: string[], itemName: string) => void;
}

export const BOMView: React.FC<BOMViewProps> = ({ bom, onHighlightComponents }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Structure', 'Envelope', 'Plumbing', 'HVAC', 'Electrical'];

  const filtered = bom.filter((item) => {
    const matchesSearch = item.item.toLowerCase().includes(search.toLowerCase()) || item.specification.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalCost = bom.reduce((acc, curr) => acc + curr.estimatedTotalCost, 0);
  const verifiedCount = bom.filter((b) => b.priceSource === 'VERIFIED CURRENT QUOTE' || b.priceSource === 'PUBLISHED CURRENT PRICE').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Summary Stats */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Deterministic Quantity & BOM Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Material quantities calculated deterministically from validated 3D BIM geometry. Never estimated by LLM.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Total Estimated Material Cost</span>
              <span className="text-2xl font-black text-emerald-400">${(totalCost ?? 0).toLocaleString()}</span>
            </div>
            <div className="h-6 w-px bg-slate-800 mx-1" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Verified Current Prices</span>
              <span className="text-xs font-bold text-cyan-400">{verifiedCount} / {bom.length} Items</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search materials or specs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white font-semibold shadow'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-3.5">Material / Spec</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Modeled Qty</th>
                <th className="p-3.5">Waste %</th>
                <th className="p-3.5">Procurement Qty</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Price Source</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Total Est</th>
                <th className="p-3.5 text-right">3D Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-200 font-sans">{item.item}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{item.specification}</div>
                  </td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5">{item.modeledQuantity} {item.unit}</td>
                  <td className="p-3.5 text-amber-400">+{item.wastePercent}%</td>
                  <td className="p-3.5 font-bold text-cyan-300">{item.procurementQuantity} {item.unit}</td>
                  <td className="p-3.5">${item.unitPrice}</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {item.priceSource}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans">
                    <div className="text-slate-200">{item.supplierName}</div>
                    <div className="text-[10px] text-slate-400">{item.supplierDistanceMiles} mi • Lead: {item.leadTimeWeeks}w</div>
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">${(item.estimatedTotalCost ?? 0).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-sans">
                    <button
                      onClick={() => onHighlightComponents && onHighlightComponents(item.sourceComponentIds, item.item)}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 transition flex items-center gap-1 ml-auto"
                    >
                      <Layers className="w-3 h-3" /> Highlight 3D
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
