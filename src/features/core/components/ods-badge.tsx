'use client';

const ODS_COLORS: Record<number, string> = {
  7:  'bg-yellow-400 text-yellow-900',
  8:  'bg-orange-400 text-orange-900',
  11: 'bg-amber-500 text-amber-950',
  12: 'bg-amber-700 text-white',
  13: 'bg-green-600 text-white',
};

export function OdsBadge({ ids }: { ids: number[] }) {
  return (
    <div className='flex flex-wrap gap-1 mt-2'>
      {ids.map(id => (
        <span
          key={id}
          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${ODS_COLORS[id] ?? 'bg-gray-200 text-gray-700'}`}
        >
          ODS {id}
        </span>
      ))}
    </div>
  );
}
