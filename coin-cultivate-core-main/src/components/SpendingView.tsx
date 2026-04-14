import { useState } from "react";
import { useTransactions, useAddTransaction, useRules } from "@/hooks/useSupabaseData";
import { categories, getTodayCategorySpending } from "@/lib/data";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import CooldownPopup from "./CooldownPopup";
import { useAddInvestment } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

const SpendingView = () => {
  const { data: transactions, isLoading } = useTransactions();
  const { data: rules } = useRules();
  const addTransaction = useAddTransaction();
  const addInvestment = useAddInvestment();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchDate, setSearchDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Cooldown popup state
  const [cooldown, setCooldown] = useState<{ show: boolean; category: string; amount: number; limit: number }>({ show: false, category: "", amount: 0, limit: 0 });

  const filtered = (transactions ?? []).filter(t => {
    if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
    if (searchDate && t.transaction_date !== searchDate) return false;
    return true;
  });

  const categoryColor = (cat: string) => {
    const map: Record<string, string> = {
      Food: "bg-primary/20 text-primary", Shopping: "bg-gradient-end/20 text-gradient-end",
      Transport: "bg-accent/20 text-accent", Entertainment: "bg-warning/20 text-warning",
      Bills: "bg-destructive/20 text-destructive", Health: "bg-gradient-end/20 text-gradient-end",
      Education: "bg-primary/20 text-primary", Other: "bg-muted text-muted-foreground",
    };
    return map[cat] || map.Other;
  };

  const submitTransaction = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) { toast.error("Enter a valid amount"); return; }

    // Check rules for cooldown
    const matchingRule = (rules ?? []).find(r => r.active && r.category === category);
    if (matchingRule) {
      const todaySpent = getTodayCategorySpending(transactions ?? [], category);
      if (todaySpent + numAmount > matchingRule.threshold) {
        setCooldown({ show: true, category, amount: numAmount, limit: matchingRule.threshold });
        return;
      }
    }

    await doSubmit(numAmount);
  };

  const doSubmit = async (numAmount: number) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    try {
      await addTransaction.mutateAsync({ amount: numAmount, category, transaction_date: date, transaction_time: timeStr });

      // Auto-invest if rule triggered
      const matchingRule = (rules ?? []).find(r => r.active && r.category === category);
      if (matchingRule) {
        const todaySpent = getTodayCategorySpending(transactions ?? [], category) + numAmount;
        if (todaySpent > matchingRule.threshold) {
          await addInvestment.mutateAsync({ amount: matchingRule.action_amount, type: "Index Fund", source_rule_id: matchingRule.id });
          toast.success(`₹${matchingRule.action_amount} auto-invested via rule!`);
        }
      }

      toast.success("Transaction added!");
      setAmount("");
      setShowForm(false);
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  const handleCooldownConfirm = () => {
    setCooldown({ show: false, category: "", amount: 0, limit: 0 });
    doSubmit(Number(amount));
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <CooldownPopup isOpen={cooldown.show} category={cooldown.category} amount={cooldown.amount} limit={cooldown.limit}
        onConfirm={handleCooldownConfirm} onCancel={() => setCooldown({ show: false, category: "", amount: 0, limit: 0 })} />

      {/* Add Transaction toggle */}
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gradient-to-r from-primary to-gradient-end text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
        <Plus className="w-4 h-4" /> Add Transaction
      </button>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="glass-card p-5 animate-scale-in glow">
          <h3 className="text-sm font-semibold mb-4">New Transaction</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Amount (₹)</label>
              <input type="number" placeholder="500" value={amount} onChange={e => setAmount(e.target.value)} min="1"
                className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors text-foreground">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors" />
            </div>
            <div className="flex items-end">
              <button onClick={submitTransaction} disabled={addTransaction.isPending}
                className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {addTransaction.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-secondary/50 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="bg-transparent text-sm flex-1 outline-none text-foreground">
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)}
            className="bg-transparent text-sm outline-none text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium p-4">Time</th>
                <th className="text-left text-xs text-muted-foreground font-medium p-4">Date</th>
                <th className="text-left text-xs text-muted-foreground font-medium p-4">Category</th>
                <th className="text-right text-xs text-muted-foreground font-medium p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 text-sm">{t.transaction_time || "—"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{t.transaction_date}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColor(t.category)}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-semibold">₹{Number(t.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {(transactions ?? []).length === 0 ? "No transactions yet. Add your first one!" : "No transactions match your filters"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpendingView;
