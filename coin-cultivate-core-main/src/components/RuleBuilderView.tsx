import { useState } from "react";
import { useRules, useAddRule, useToggleRule, useDeleteRule } from "@/hooks/useSupabaseData";
import { categories } from "@/lib/data";
import { Plus, Zap, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const RuleBuilderView = () => {
  const { data: rules, isLoading } = useRules();
  const addRule = useAddRule();
  const toggleRule = useToggleRule();
  const deleteRule = useDeleteRule();
  const [newCategory, setNewCategory] = useState("Food");
  const [newThreshold, setNewThreshold] = useState("");
  const [newAction, setNewAction] = useState("");

  const handleAdd = async () => {
    if (!newThreshold || !newAction || Number(newThreshold) <= 0 || Number(newAction) <= 0) {
      toast.error("Enter valid positive values");
      return;
    }
    try {
      await addRule.mutateAsync({ category: newCategory, threshold: Number(newThreshold), action_amount: Number(newAction) });
      toast.success("Rule created!");
      setNewThreshold("");
      setNewAction("");
    } catch {
      toast.error("Failed to create rule");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await toggleRule.mutateAsync({ id, active: !active });
  };

  const handleDelete = async (id: string) => {
    await deleteRule.mutateAsync(id);
    toast.success("Rule deleted");
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 glow">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Create New Rule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">If Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors text-foreground">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Exceeds (₹/day)</label>
            <input type="number" placeholder="300" value={newThreshold} onChange={e => setNewThreshold(e.target.value)}
              className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Then Invest (₹)</label>
            <input type="number" placeholder="50" value={newAction} onChange={e => setNewAction(e.target.value)}
              className="w-full bg-secondary/50 rounded-lg px-3 py-2.5 text-sm outline-none border border-border focus:border-primary transition-colors" />
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} disabled={addRule.isPending}
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {addRule.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Rule
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Rules</h3>
        {(rules ?? []).length === 0 && (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">No rules yet. Create your first automation rule above!</div>
        )}
        {(rules ?? []).map(rule => (
          <div key={rule.id} className={`glass-card-hover p-4 flex items-center justify-between ${!rule.active ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${rule.active ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm font-medium">
                  IF <span className="text-primary">{rule.category}</span> &gt; ₹{Number(rule.threshold).toLocaleString()}/day
                </p>
                <p className="text-xs text-muted-foreground">THEN invest ₹{Number(rule.action_amount).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(rule.id, rule.active)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${rule.active ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                {rule.active ? "Active" : "Paused"}
              </button>
              <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleBuilderView;
