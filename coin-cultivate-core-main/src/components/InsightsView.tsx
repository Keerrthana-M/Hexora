import { useTransactions } from "@/hooks/useSupabaseData";
import { detectPersonality } from "@/lib/data";
import { Brain, AlertTriangle, TrendingDown, Shield, Loader2 } from "lucide-react";
import { useMemo } from "react";

const InsightsView = () => {
  const { data: transactions, isLoading } = useTransactions();
  const insights = useMemo(() => detectPersonality(transactions ?? []), [transactions]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-8 text-center glow">
        <Brain className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Your Spending Personality</p>
        <p className="text-3xl font-bold gradient-text mt-2">{insights.personality}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Risk Level</span>
          </div>
          <p className={`text-2xl font-bold ${insights.risk === "High" ? "text-destructive" : insights.risk === "Medium" ? "text-warning" : "text-accent"}`}>
            {insights.risk}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Based on your spending patterns</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Future Loss Prediction</span>
          </div>
          <p className="text-2xl font-bold text-warning">₹{insights.futureLoss.toLocaleString()}/mo</p>
          <p className="text-xs text-muted-foreground mt-1">At your current spending rate</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Smart Nudges
        </h3>
        <div className="space-y-3">
          {[
            { text: "Reduce food spending by ₹100/day to save ₹3,000/month", type: "tip" },
            { text: "Set up automation rules to auto-invest when you overspend", type: "tip" },
            { text: `Your spending personality: ${insights.personality} — consider setting daily limits`, type: "warning" },
            { text: "Track every transaction to improve your financial score", type: "success" },
          ].map((nudge, i) => (
            <div key={i} className={`p-3 rounded-lg border text-sm ${
              nudge.type === "warning" ? "bg-warning/5 border-warning/20 text-warning" :
              nudge.type === "success" ? "bg-accent/5 border-accent/20 text-accent" :
              "bg-primary/5 border-primary/20 text-primary"
            }`}>
              {nudge.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsView;
