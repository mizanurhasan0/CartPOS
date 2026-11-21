import React from 'react';
import { useSelector } from 'react-redux';

/** Compact stat tile. type='currency' prefixes the store currency symbol (2 decimals). */
export default function StatCard({ title, amount = 0, type = '', icon, bare = false }) {
  const currency = useSelector((state) => state.storeStore?.store?.currency || { symbol: '$' });
  const value = type === 'currency' ? `${currency.symbol} ${Number(amount || 0).toFixed(2)}` : (amount ?? 0);
  return (
    <div className={`flex items-center gap-3 min-w-0 ${bare ? '' : 'rounded-xl border border-border bg-white p-3'}`}>
      {icon && <span className="shrink-0 w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-label truncate">{title}</p>
        <p className="text-lg font-semibold text-black truncate">{value}</p>
      </div>
    </div>
  );
}
