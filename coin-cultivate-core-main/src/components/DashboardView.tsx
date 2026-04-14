import { TrendingUp, Wallet, Brain, AlertTriangle, Loader2 } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTransactions, useInvestments } from "@/hooks/useSupabaseData";
import { calculateFinancialScore, categories } from "@/lib/data";
import { useMemo } from "react";

const StatCard = ({ icon: Icon, label, value, sub, iconColor }: { icon: any; label: string; value: string; sub?: string; iconColor: string }) => (
  <div className="glass-card p-5 animate-slide-up">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}20` }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const categoryColors: Record<string, string> = {
  Food: "hsl(199, 89%, 48%)", Shopping: "hsl(250, 80%, 60%)", Transport: "hsl(160, 84%, 39%)",
  Entertainment: "hsl(38, 92%, 50%)", Bills: "hsl(0, 72%, 51%)", Health: "hsl(280, 70%, 50%)",
  Education: "hsl(200, 70%, 60%)", Other: "hsl(215, 20%, 55%)",
};

const DashboardView = () => {
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: investments, isLoading: invLoading } = useInvestments();

  const score = useMemo(() => calculateFinancialScore(transactions ?? []), [transactions]);

  const totalSpent = useMemo(() => (transactions ?? []).reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const totalInvested = useMemo(() => (investments ?? []).reduce((s, i) => s + Number(i.amount), 0), [investments]);
  const balance = 15000 - totalSpent + totalInvested; // simulated base balance

  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayTx = (transactions ?? []).filter(t => t.transaction_date === dateStr);
      return { day: days[d.getDay()], amount: dayTx.reduce((s, t) => s + Number(t.amount), 0) };
    });
  }, [transactions]);

  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    (transactions ?? []).forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value, fill: categoryColors[name] || categoryColors.Other }));
  }, [transactions]);

  const today = new Date().toISOString().split("T")[0];
  const todaySpent = useMemo(() => (transactions ?? []).filter(t => t.transaction_date === today).reduce((s, t) => s + Number(t.amount), 0), [transactions, today]);

  if (txLoading || invLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Balance" value={`₹${balance.toLocaleString()}`} sub="Simulated balance" iconColor="hsl(199, 89%, 48%)" />
        <StatCard icon={TrendingUp} label="Invested" value={`₹${totalInvested.toLocaleString()}`} sub={`${(investments ?? []).length} investments`} iconColor="hsl(160, 84%, 39%)" />
        <StatCard icon={Brain} label="Financial Score" value={`${score}/100`} sub={score > 70 ? "Good standing" : "Needs improvement"} iconColor="hsl(250, 80%, 60%)" />
        <div className="glass-card p-5 animate-slide-up border-warning/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Today's Spending</span>
          </div>
          <p className="text-2xl font-bold">₹{todaySpent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{(transactions ?? []).filter(t => t.transaction_date === today).length} transactions today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Spending</h3>
          {weeklyData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 22%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
                <Area type="monotone" dataKey="amount" stroke="hsl(199, 89%, 48%)" fill="url(#spendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">No spending data yet. Add transactions to see your chart.</div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {catData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                    {catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222, 40%, 10%)", border: "1px solid hsl(222, 30%, 22%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {catData.map(c => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
