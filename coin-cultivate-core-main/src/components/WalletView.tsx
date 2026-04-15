import { useInvestments } from "@/hooks/useSupabaseData";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { useMemo } from "react";

const typeColors: Record<string, string> = {
  "Gold Fund": "hsl(38, 92%, 50%)",
  "Index Fund": "hsl(199, 89%, 48%)",
  "Savings": "hsl(160, 84%, 39%)",
};

const WalletView = () => {
  const { data: investments, isLoading } = useInvestments();

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    (investments ?? []).forEach(i => { map[i.type] = (map[i.type] || 0) + Number(i.amount); });
    return Object.entries(map).map(([type, amount]) => ({ type, amount, color: typeColors[type] || "hsl(215, 20%, 55%)" }));
  }, [investments]);

  const total = byType.reduce((s, i) => s + i.amount, 0);

  const growthData = useMemo(() => {
    const sorted = [...(investments ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let cumulative = 0;
    const data: { date: string; amount: number }[] = [];
    sorted.forEach(inv => {
      cumulative += Number(inv.amount);
      const d = new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      data.push({ date: d, amount: cumulative });
    });
    return data;
  }, [investments]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 glow text-center">
        <p className="text-sm text-muted-foreground">Total Invested</p>
        <p className="text-4xl font-bold gradient-text mt-1">₹{total.toLocaleString()}</p>
        <p className="text-xs text-accent mt-2 flex items-center justify-center gap-1">
          <TrendingUp className="w-3 h-3" /> {(investments ?? []).length} investments total
        </p>
      </div>

      {byType.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {byType.map(inv => (
            <div key={inv.type} className="glass-card-hover p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: inv.color }} />
                <span className="text-sm font-medium">{inv.type}</span>
              </div>
              <p className="text-2xl font-bold">₹{inv.amount.toLocaleString()}</p>
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (inv.amount / total) * 100 : 0}%`, backgroundColor: inv.color }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-muted-foreground text-sm">No investments yet. Create rules to auto-invest when you overspend!</div>
      )}

      {growthData.length > 1 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 22%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Area type="monotone" dataKey="amount" stroke="hsl(160, 84%, 39%)" fill="url(#growthGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WalletView;
