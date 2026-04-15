export const categories = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Health", "Education", "Other"];

export function calculateFinancialScore(transactions: { amount: number; transaction_date: string; category: string }[]): number {
  let score = 100;
  const today = new Date().toISOString().split("T")[0];
  const todayTx = transactions.filter(t => t.transaction_date === today);
  const totalToday = todayTx.reduce((s, t) => s + Number(t.amount), 0);
  if (totalToday > 1500) score -= 15;
  else if (totalToday > 1000) score -= 10;
  const foodToday = todayTx.filter(t => t.category === "Food").reduce((s, t) => s + Number(t.amount), 0);
  if (foodToday > 300) score -= 5;
  // Bonus for having investments
  score += 2;
  return Math.max(0, Math.min(100, score));
}

export function detectPersonality(transactions: { amount: number }[]): { personality: string; risk: string; futureLoss: number } {
  const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
  const avg = total / 7;
  if (avg > 800) return { personality: "Impulsive Spender", risk: "High", futureLoss: 6000 };
  if (avg > 500) return { personality: "Moderate Spender", risk: "Medium", futureLoss: 3500 };
  return { personality: "Mindful Saver", risk: "Low", futureLoss: 1000 };
}

export function getTodayCategorySpending(transactions: { amount: number; category: string; transaction_date: string }[], category: string): number {
  const today = new Date().toISOString().split("T")[0];
  return transactions
    .filter(t => t.category === category && t.transaction_date === today)
    .reduce((s, t) => s + Number(t.amount), 0);
}
