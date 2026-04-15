import { Flame, Trophy, Target, Clock } from "lucide-react";

const challenges = [
  { title: "No Food Spend Challenge", streak: 3, maxDays: 7, reward: 150, active: true, emoji: "🍔" },
  { title: "Save ₹500 This Week", streak: 4, maxDays: 7, reward: 200, active: true, emoji: "💰" },
  { title: "No Shopping Weekend", streak: 0, maxDays: 2, reward: 100, active: false, emoji: "🛍️" },
  { title: "Transport Budget Master", streak: 5, maxDays: 5, reward: 175, active: true, emoji: "🚗" },
];

const ChallengesView = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="glass-card p-6 text-center glow">
      <Trophy className="w-10 h-10 text-warning mx-auto mb-2" />
      <p className="text-2xl font-bold">3 Active Challenges</p>
      <p className="text-sm text-muted-foreground mt-1">Complete challenges to earn rewards</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {challenges.map((ch, i) => (
        <div key={i} className={`glass-card-hover p-5 ${!ch.active ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ch.emoji}</span>
              <div>
                <p className="text-sm font-semibold">{ch.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Reward: ₹{ch.reward}</p>
              </div>
            </div>
            {ch.active && ch.streak > 0 && (
              <div className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium">
                <Flame className="w-3 h-3" /> {ch.streak} days
              </div>
            )}
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
              style={{ width: `${(ch.streak / ch.maxDays) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{ch.streak}/{ch.maxDays} days</span>
            <span>{ch.active ? (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In progress</span>
            ) : (
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Not started</span>
            )}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ChallengesView;
