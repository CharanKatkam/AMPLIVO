'use client';
import { serviceCatalog } from '@/data/sales';

interface ServiceSelectorProps {
  selected: string[];
  onChange: (services: string[]) => void;
}

const categories = [...new Set(serviceCatalog.map((s) => s.category))];

export function ServiceSelector({ selected, onChange }: ServiceSelectorProps) {
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const services = serviceCatalog.filter((s) => s.category === category);
        return (
          <div key={category}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{category}</div>
            <div className="space-y-1.5">
              {services.map((svc) => {
                const isSelected = selected.includes(svc.name);
                return (
                  <label
                    key={svc.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-50 border-violet-200'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(svc.name)}
                      className="w-4 h-4 rounded border-slate-300 accent-[#4C1D95] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isSelected ? 'text-[#4C1D95]' : 'text-slate-700'}`}>
                        {svc.name}
                      </div>
                      {svc.monthlyPrice > 0 && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          ₹{svc.monthlyPrice.toLocaleString('en-IN')}/mo
                          {svc.setupFee > 0 && ` + ₹${svc.setupFee.toLocaleString('en-IN')} setup`}
                        </div>
                      )}
                      {svc.monthlyPrice === 0 && svc.setupFee > 0 && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          ₹{svc.setupFee.toLocaleString('en-IN')} (one-time)
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
