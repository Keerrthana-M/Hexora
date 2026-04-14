import { useState } from "react";
import { LayoutDashboard, CreditCard, Zap, Wallet, Brain, Trophy, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardView from "@/components/DashboardView";
import SpendingView from "@/components/SpendingView";
import RuleBuilderView from "@/components/RuleBuilderView";
import WalletView from "@/components/WalletView";
import InsightsView from "@/components/InsightsView";
import ChallengesView from "@/components/ChallengesView";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "spending", label: "Spending", icon: CreditCard },
  { id: "rules", label: "Rules", icon: Zap },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "insights", label: "Insights", icon: Brain },
  { id: "challenges", label: "Challenges", icon: Trophy },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, signOut } = useAuth();

  const renderView = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView />;
      case "spending": return <SpendingView />;
      case "rules": return <RuleBuilderView />;
      case "wallet": return <WalletView />;
      case "insights": return <InsightsView />;
      case "challenges": return <ChallengesView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gradient-end flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">MindWealth <span className="gradient-text">AI</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
            <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title="Sign out">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/40 sticky top-[65px] z-40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderView()}
      </main>
    </div>
  );
};

export default Index;
