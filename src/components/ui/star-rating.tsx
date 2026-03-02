import { useState } from 'react';
import { Star } from 'lucide-react';

const ratingDescriptions: Record<number, string> = {
  5: "Value Added: You received more than you paid for. This is reserved for upgrades, an empty row, arriving >20 minutes early, or a crew that fixed a problem before you even noticed it.",
  4: "Full Delivery: The airline met 100% of their contract. You arrived on time, your seat/tech worked perfectly, and the service was professional. No complaints, but no \"bonuses.\"",
  3: "Partial Friction: The core service was delivered, but with minor lapses—a 30-minute delay, a messy seat pocket, or a \"transactional\" crew that was slightly dismissive.",
  2: "Significant Failure: The product was broken. Major delays (>1 hour), broken hardware (no power/non-functional seat), or a service failure that required you to complain to get a resolution.",
  1: "Non-Performance: The flight was canceled, you were bumped, luggage was lost, or a safety issue occurred. The airline failed to get you and your gear from A to B as promised.",
};

const labels: Record<number, string> = {
  5: "5 — Value Added",
  4: "4 — Full Delivery",
  3: "3 — Partial Friction",
  2: "2 — Significant Failure",
  1: "1 — Non-Performance",
};

export function StarRating({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : (value || 0);

  const handleMouseMove = (_e: React.MouseEvent<HTMLDivElement>, index: number) => {
    setHoverValue(index + 1);
  };


  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(null)}>
        {[0, 1, 2, 3, 4].map((index) => {
          const filled = displayValue - index;
          return (
            <div
              key={index}
              className="cursor-pointer relative p-1"
              onMouseMove={(e) => handleMouseMove(e, index)}
              onClick={() => {
                if (hoverValue) onChange(hoverValue);
              }}
            >
              <Star className="w-8 h-8 text-muted-foreground/30" strokeWidth={1.5} />
              {filled > 0 && (
                <div className="absolute top-1 left-1 overflow-hidden w-full">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-500" strokeWidth={1.5} />
                </div>
              )}
            </div>
          );
        })}
        {displayValue > 0 && (
          <span className="ml-3 font-medium text-sm text-muted-foreground w-12">
            {displayValue}
          </span>
        )}
      </div>
      {displayValue > 0 && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl min-h-[80px] border">
          <span className="font-semibold block mb-1 text-foreground">{labels[displayValue] || `${displayValue} Stars`}</span>
          {ratingDescriptions[displayValue]}
        </div>
      )}
    </div>
  );
}
