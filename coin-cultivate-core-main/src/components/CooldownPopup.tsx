import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Timer, X } from "lucide-react";

interface CooldownPopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  category: string;
  amount: number;
  limit: number;
}

const CooldownPopup = ({ isOpen, onConfirm, onCancel, category, amount, limit }: CooldownPopupProps) => {
  const [countdown, setCountdown] = useState(7);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(7);
      setCanContinue(false);
      return;
    }
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanContinue(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (canContinue) onConfirm();
  }, [canContinue, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={onCancel} />

      {/* Modal */}
      <div className="relative glass-card p-6 sm:p-8 max-w-md w-full animate-scale-in border-warning/30 glow">
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>

          <h3 className="text-xl font-bold mb-2">Budget Exceeded!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Adding ₹{amount.toLocaleString()} to <span className="text-primary font-medium">{category}</span> exceeds your daily limit of ₹{limit.toLocaleString()}.
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Timer className={`w-5 h-5 ${canContinue ? 'text-accent' : 'text-warning'}`} />
            {canContinue ? (
              <span className="text-accent font-medium text-sm">You can now proceed</span>
            ) : (
              <span className="text-warning font-medium text-sm">
                Think about it... {countdown}s
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((7 - countdown) / 7) * 100}%`,
                background: canContinue
                  ? "hsl(160, 84%, 39%)"
                  : "linear-gradient(90deg, hsl(38, 92%, 50%), hsl(0, 72%, 51%))",
              }}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={!canContinue}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                canContinue
                  ? "bg-gradient-to-r from-primary to-gradient-end text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}>
              {canContinue ? "Continue Anyway" : "Wait..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CooldownPopup;
