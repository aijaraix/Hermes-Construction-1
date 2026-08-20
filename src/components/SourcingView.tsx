import React from 'react';
import { SupplierSource } from '../types/hermes';
import { MapPin, Truck, CheckCircle, ExternalLink, Star } from 'lucide-react';

interface SourcingViewProps {
  suppliers: SupplierSource[];
}

export const SourcingView: React.FC<SourcingViewProps> = ({ suppliers }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-2">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-400" /> Local Supplier & Procurement Intelligence
        </h2>
        <p className="text-xs text-slate-400">
          HERMES researches regional ready-mix concrete plants, steel fabricators, electrical distributors, and roofing suppliers around the project site.
        </p>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => (
          <div key={sup.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">{sup.category}</span>
                <h3 className="text-base font-bold text-slate-100">{sup.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {sup.address}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800 block">
                  {sup.distanceMiles} Miles Away
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {sup.rating} Rating
                </span>
              </div>
            </div>

            {/* Verified Product Schedule */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Local Price Evidence</span>
              <div className="space-y-1.5 font-mono text-xs">
                {sup.verifiedProducts.map((p, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-200 font-sans font-medium block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{p.availability}</span>
                    </div>
                    <span className="font-bold text-emerald-400">${p.price} / {p.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
