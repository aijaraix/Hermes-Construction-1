import React from 'react';
import { SupplierSource } from '../types/hermes';
import { MapPin, DollarSign, CheckCircle2, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';

interface ProcurementViewProps {
  suppliers: SupplierSource[];
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({ suppliers }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">LOCAL SUPPLY CHAIN & PRICE TRUTH</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Geospatial Supplier Network, Material Lead Times & Price Verification Classifications
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {suppliers.map((sup, idx) => (
          <div key={idx} className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {sup.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-1 font-sans">{sup.name}</h3>
                <p className="text-[11px] text-slate-400">{sup.address} ({sup.distanceMiles} miles)</p>
              </div>

              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                VERIFIED_CURRENT_QUOTE
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              {sup.verifiedProducts?.map((prod, pIdx) => (
                <div key={pIdx} className="space-y-1 border-b border-slate-800/60 pb-1.5 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-sans">Material:</span>
                    <span className="text-slate-200 font-bold">{prod.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-sans">Unit Price:</span>
                    <span className="text-emerald-400 font-bold">${prod.price} / {prod.unit}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px] uppercase font-sans">Lead Time:</span>
                <span className="text-cyan-300 font-bold">{sup.leadTimeDays} Days</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
