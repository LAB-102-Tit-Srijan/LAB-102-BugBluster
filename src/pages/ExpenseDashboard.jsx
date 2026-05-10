import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { db, isFirebaseConfigured } from "../firebase/config";
import { equalSplit, customSplit, percentageSplit, calculateBalances } from "../utils/splitLogic";
import { calculateRentFee } from "../utils/feeCalculator";

// Mock roommates
const ROOMMATES = [
  { id: "r1", name: "Rahul Sharma", initials: "RS", color: "#F5A623" },
  { id: "r2", name: "Priya Patel", initials: "PP", color: "#8B5CF6" },
  { id: "r3", name: "Sneha Singh", initials: "SS", color: "#10B981" },
  { id: "me", name: "You", initials: "YO", color: "#3B82F6" },
];

const CATEGORIES = [
  { key: "rent", label: "Rent", icon: "🏠" },
  { key: "electricity", label: "Electricity", icon: "⚡" },
  { key: "wifi", label: "WiFi", icon: "📶" },
  { key: "grocery", label: "Grocery", icon: "🛒" },
  { key: "maid", label: "Maid", icon: "🧹" },
  { key: "transport", label: "Transport", icon: "🚗" },
  { key: "other", label: "Other", icon: "📦" },
];

const getInitialExpenses = () => [
  {
    id: "1",
    name: "Monthly Rent",
    amount: 24000,
    category: "rent",
    paidBy: "me",
    date: "2026-05-01",
    month: "2026-05",
    splitType: "equal",
    splits: [
      { userId: "me", share: 6000, settled: false },
      { userId: "r1", share: 6000, settled: false },
      { userId: "r2", share: 6000, settled: false },
      { userId: "r3", share: 6000, settled: false },
    ],
  },
  {
    id: "2",
    name: "Electricity Bill",
    amount: 1800,
    category: "electricity",
    paidBy: "r1",
    date: "2026-05-04",
    month: "2026-05",
    splitType: "equal",
    splits: [
      { userId: "r1", share: 600, settled: true },
      { userId: "r2", share: 600, settled: false },
      { userId: "r3", share: 600, settled: false },
      { userId: "me", share: 600, settled: false },
    ],
  },
  {
    id: "3",
    name: "Grocery",
    amount: 2400,
    category: "grocery",
    paidBy: "me",
    date: "2026-05-05",
    month: "2026-05",
    splitType: "custom",
    splits: [
      { userId: "me", share: 800, settled: false },
      { userId: "r1", share: 700, settled: false },
      { userId: "r2", share: 500, settled: false },
      { userId: "r3", share: 400, settled: false },
    ],
  },
];

export default function ExpenseDashboard() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState(getInitialExpenses());
  const [toastMessage, setToastMessage] = useState(null);
  const [balances, setBalances] = useState({});
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("2026-05");
  const [showSettleModal, setShowSettleModal] = useState(null);
  const [showRemindModal, setShowRemindModal] = useState(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiStage, setUpiStage] = useState("preview");
  const [upiTimerId, setUpiTimerId] = useState(null);

  // Simple form state
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "rent",
    date: new Date().toISOString().split("T")[0],
    paidBy: "me",
    selectedMembers: ["me", "r1", "r2", "r3"],
    splitType: "equal",
    customSplits: {},
    percentageSplits: {},
  });

  const rentSharePreview = 4000;
  const rentFeePreview = calculateRentFee(rentSharePreview);

  useEffect(() => {
    const newBalances = calculateBalances(expenses, "me");
    setBalances(newBalances);
  }, [expenses]);

  useEffect(() => {
    setTimeout(() => setChartLoaded(true), 150);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getRoommateById = (id) => ROOMMATES.find((r) => r.id === id) || { id, name: "Unknown" };
  const getCategoryById = (key) => CATEGORIES.find((c) => c.key === key) || { icon: "📦" };

  const getMonthExpenses = () => expenses.filter((e) => e.month === selectedMonth);

  const handleAddExpense = () => {
    if (!formData.name.trim() || !formData.amount || formData.selectedMembers.length === 0) {
      showToast("Please fill all required fields");
      return;
    }

    try {
      let splits = [];
      const amount = parseFloat(formData.amount);

      if (formData.splitType === "equal") {
        const equalSplits = equalSplit(
          amount,
          formData.selectedMembers.map((id) => ({ userId: id }))
        );
        splits = equalSplits.map((s) => ({ ...s, settled: false }));
      } else if (formData.splitType === "custom") {
        const memberData = formData.selectedMembers.map((id) => ({
          userId: id,
          share: parseFloat(formData.customSplits[id] || 0),
        }));
        const validation = customSplit(memberData, amount);
        if (!validation.isValid) {
          showToast("Custom splits must equal total amount");
          return;
        }
        splits = validation.members.map((s) => ({ ...s, settled: false }));
      } else if (formData.splitType === "percentage") {
        const memberData = formData.selectedMembers.map((id) => ({
          userId: id,
          percentage: parseFloat(formData.percentageSplits[id] || 0),
        }));
        const validation = percentageSplit(amount, memberData);
        if (!validation.isValid) {
          showToast("Percentages must equal 100%");
          return;
        }
        splits = validation.members.map((s) => ({ ...s, settled: false }));
      }

      const newExpense = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        amount,
        category: formData.category,
        paidBy: formData.paidBy,
        date: formData.date,
        month: formData.date.slice(0, 7),
        splitType: formData.splitType,
        splits,
      };

      setExpenses([newExpense, ...expenses]);
      setFormData({
        name: "",
        amount: "",
        category: "rent",
        date: new Date().toISOString().split("T")[0],
        paidBy: "me",
        selectedMembers: ["me", "r1", "r2", "r3"],
        splitType: "equal",
        customSplits: {},
        percentageSplits: {},
      });
      setFormStep(1);
      showToast("Expense split done! 🎉");
    } catch (error) {
      console.error("Error adding expense:", error);
      showToast("Failed to add expense");
    }
  };

  const settleSplit = (expenseId, userId) => {
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    const updatedSplits = expense.splits.map((s) =>
      s.userId === userId ? { ...s, settled: true } : s
    );

    const updatedExpenses = expenses.map((e) =>
      e.id === expenseId ? { ...e, splits: updatedSplits } : e
    );

    setExpenses(updatedExpenses);
    setShowSettleModal(null);
    showToast("Marked as settled! ✅");
  };

  const monthExpenses = getMonthExpenses();
  const categoryData = {};
  monthExpenses.forEach((e) => {
    categoryData[e.category] = (categoryData[e.category] || 0) + e.amount;
  });
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const changeMonth = (delta) => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(year, parseInt(month) - 1 + delta);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  const getMonthLabel = () => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  const openMockUpi = () => {
    setShowUpiModal(true);
    setUpiStage("opening");

    if (upiTimerId) {
      window.clearTimeout(upiTimerId);
    }

    const timerId = window.setTimeout(() => {
      setUpiStage("success");
    }, 2000);

    setUpiTimerId(timerId);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0D1117] px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {toastMessage && (
            <div className="fixed top-4 right-4 z-50 rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-200">
              {toastMessage}
            </div>
          )}

          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Roommate Expenses</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">HabiWise Split</h1>
          </div>

          {/* BALANCES SECTION */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Balances</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ROOMMATES.filter((r) => r.id !== "me").map((roommate) => {
                const balance = balances[roommate.id] || 0;
                const isSettled = balance === 0;
                const theyOweYou = balance > 0;

                let bgClass = "bg-slate-900/90 border-slate-800";
                let statusText = "All settled ✅";
                let statusIcon = "⚪";

                if (!isSettled) {
                  if (theyOweYou) {
                    bgClass = "bg-emerald-500/10 border-emerald-500/30";
                    statusText = `Owes you ₹${balance.toLocaleString()}`;
                    statusIcon = "🟢";
                  } else {
                    bgClass = "bg-red-500/10 border-red-500/30";
                    statusText = `You owe ₹${Math.abs(balance).toLocaleString()}`;
                    statusIcon = "🔴";
                  }
                }

                return (
                  <div key={roommate.id} className={`rounded-2xl border ${bgClass} p-4 shadow-lg`}>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black"
                        style={{ backgroundColor: roommate.color }}
                      >
                        {roommate.initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-300">{roommate.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{statusIcon} {statusText}</p>
                      </div>
                    </div>
                    {!isSettled && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setShowRemindModal(roommate.id)}
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900"
                        >
                          📲 Remind
                        </button>
                        {theyOweYou && (
                          <button
                            onClick={() => setShowSettleModal(roommate)}
                            className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                          >
                            ✅ Settle
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RENT PAYMENT PREVIEW */}
          <div className="rounded-2xl border border-amber-500/25 bg-[#0D1117] p-6 shadow-lg shadow-black/30">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Payment Preview</p>
                <h2 className="mt-2 text-xl font-bold text-white">🏠 Your Rent Share</h2>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                Mock UPI only
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Your Rent Share</span>
                  <span className="font-black text-white">₹{rentSharePreview.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Processing Fee (2%)</span>
                  <span className="font-black text-amber-300">₹{rentFeePreview.processingFee.toLocaleString()}</span>
                </div>
                <div className="mt-4 h-px bg-slate-800" />
                <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
                  <span className="font-semibold">Total via HabiWise</span>
                  <span className="font-black">₹{rentFeePreview.total.toLocaleString()}</span>
                </div>
                <p className="mt-3 text-xs text-slate-400">Saves you ₹400 vs broker</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <button
                  type="button"
                  onClick={openMockUpi}
                  className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-black transition hover:bg-amber-400"
                >
                  Pay via UPI 💸
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">Zero real payments. Mock flow only.</p>
              </div>
            </div>
          </div>

          {/* 3-STEP FORM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {formStep} of 3</p>
              <div className="mt-2 h-1 w-full bg-slate-800 rounded-full">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${(formStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {formStep === 1 && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Expense name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Amount (₹)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none"
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-amber-500 outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setFormData({ ...formData, category: cat.key })}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        formData.category === cat.key
                          ? "bg-amber-500/15 border-amber-400 text-amber-200"
                          : "border border-slate-700 bg-slate-950 text-slate-300"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-amber-500 outline-none"
                >
                  {ROOMMATES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setFormStep(2)}
                  className="w-full rounded-xl bg-amber-500 py-3 font-black text-black hover:bg-amber-400"
                >
                  Next: Choose Members
                </button>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-4">
                {ROOMMATES.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.selectedMembers.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, selectedMembers: [...formData.selectedMembers, r.id] });
                        } else {
                          setFormData({ ...formData, selectedMembers: formData.selectedMembers.filter((id) => id !== r.id) });
                        }
                      }}
                      className="h-5 w-5 rounded"
                    />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-black" style={{ backgroundColor: r.color }}>
                      {r.initials}
                    </div>
                    <span className="text-sm font-semibold text-slate-300">{r.name}</span>
                  </label>
                ))}
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setFormStep(1)} className="flex-1 rounded-lg border border-slate-700 bg-slate-950 py-2 text-sm font-semibold">
                    Back
                  </button>
                  <button onClick={() => setFormStep(3)} className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-bold text-black">
                    Next: Split Type
                  </button>
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-slate-700">
                  {["equal", "custom", "percentage"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, splitType: type })}
                      className={`px-4 py-2 text-sm font-semibold ${formData.splitType === type ? "border-b-2 border-amber-400 text-amber-300" : "text-slate-400"}`}
                    >
                      {type === "equal" ? "Equal" : type === "custom" ? "Custom ₹" : "Percentage %"}
                    </button>
                  ))}
                </div>

                {formData.splitType === "equal" && (
                  <p className="text-lg font-semibold text-amber-300">
                    Each: ₹{(parseFloat(formData.amount) / formData.selectedMembers.length).toFixed(2)}
                  </p>
                )}

                {formData.splitType === "custom" && (
                  <div className="space-y-2">
                    {formData.selectedMembers.map((id) => (
                      <input
                        key={id}
                        type="number"
                        value={formData.customSplits[id] || ""}
                        onChange={(e) => setFormData({ ...formData, customSplits: { ...formData.customSplits, [id]: e.target.value } })}
                        placeholder={`${getRoommateById(id).name} share`}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none text-sm"
                      />
                    ))}
                  </div>
                )}

                {formData.splitType === "percentage" && (
                  <div className="space-y-2">
                    {formData.selectedMembers.map((id) => (
                      <input
                        key={id}
                        type="number"
                        value={formData.percentageSplits[id] || ""}
                        onChange={(e) => setFormData({ ...formData, percentageSplits: { ...formData.percentageSplits, [id]: e.target.value } })}
                        placeholder={`${getRoommateById(id).name} %`}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 outline-none text-sm"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setFormStep(2)} className="flex-1 rounded-lg border border-slate-700 bg-slate-950 py-2 text-sm font-semibold">
                    Back
                  </button>
                  <button onClick={handleAddExpense} className="flex-1 rounded-lg bg-amber-500 py-2 text-sm font-bold text-black">
                    Add Expense
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MONTHLY SUMMARY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Summary</h2>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="rounded px-3 py-1 border border-slate-700 bg-slate-950 text-sm">
                  ←
                </button>
                <span className="text-sm font-semibold text-slate-300 min-w-[120px] text-center">{getMonthLabel()}</span>
                <button onClick={() => changeMonth(1)} className="rounded px-3 py-1 border border-slate-700 bg-slate-950 text-sm">
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Total Spent</p>
                <p className="mt-1 text-lg font-black text-amber-300">₹{totalSpent.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Your Share</p>
                <p className="mt-1 text-lg font-black text-amber-300">₹{monthExpenses.reduce((sum, e) => sum + (e.splits.find((s) => s.userId === "me")?.share || 0), 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">You Paid</p>
                <p className="mt-1 text-lg font-black text-amber-300">₹{monthExpenses.filter((e) => e.paidBy === "me").reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <p className="text-xs text-slate-400">Balance</p>
                <p className="mt-1 text-lg font-black text-amber-300">₹{Math.abs(balances.r1 || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* BAR CHART */}
            {Object.entries(categoryData).map(([cat, amount]) => {
              const catObj = getCategoryById(cat);
              const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <div key={cat} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{catObj.icon} {CATEGORIES.find((c) => c.key === cat)?.label}</span>
                    <span className="text-amber-300">₹{amount.toLocaleString()} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-1000"
                      style={{ width: chartLoaded ? `${pct}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* EXPENSE LIST */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Expense History</h2>
            {monthExpenses.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No expenses this month</p>
            ) : (
              <div className="space-y-2">
                {monthExpenses.map((expense) => {
                  const cat = getCategoryById(expense.category);
                  const isExpanded = expandedExpense === expense.id;
                  const paidBy = getRoommateById(expense.paidBy);
                  const yourSplit = expense.splits.find((s) => s.userId === "me");

                  return (
                    <div key={expense.id} className="rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
                      <button
                        onClick={() => setExpandedExpense(isExpanded ? null : expense.id)}
                        className="w-full p-4 text-left hover:bg-slate-900 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <div>
                              <p className="font-semibold text-white">{expense.name}</p>
                              <p className="text-xs text-slate-400">{paidBy.name} • {expense.date} • Your: ₹{yourSplit?.share}</p>
                            </div>
                          </div>
                          <p className="font-black text-amber-300">₹{expense.amount.toLocaleString()}</p>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="bg-slate-900 border-t border-slate-700 p-4 space-y-2">
                          {expense.splits.map((split) => {
                            const member = getRoommateById(split.userId);
                            return (
                              <div key={split.userId} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-black" style={{ backgroundColor: member.color }}>
                                    {member.initials}
                                  </div>
                                  <span className="text-slate-300">{member.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-300">₹{split.share}</span>
                                  <span className="text-slate-400">{split.settled ? "✅" : "⏳"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SETTLE MODAL */}
        {showSettleModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold">Settle Payment</h3>
               <p className="mt-2 text-sm text-slate-300">Mark {showSettleModal.name}'s payment of ₹{Math.abs(balances[showSettleModal.id] || 0)} as settled?</p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => setShowSettleModal(null)} className="flex-1 rounded px-4 py-2 border border-slate-700 text-sm font-semibold">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const expensesToSettle = expenses.filter((e) => e.splits.some((s) => s.userId === showSettleModal.id && !s.settled));
                    if (expensesToSettle.length > 0) {
                      settleSplit(expensesToSettle[0].id, showSettleModal.id);
                    }
                  }}
                  className="flex-1 rounded px-4 py-2 bg-emerald-500 text-sm font-semibold text-black"
                >
                  Yes ✅
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REMIND MODAL */}
        {showRemindModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold">📲 Send Reminder</h3>
               <div className="mt-4 bg-slate-950 p-3 rounded text-sm text-slate-300">
                 Hey! 👋 <br />
                 You owe ₹{Math.abs(balances[showRemindModal] || 0)} for shared expenses. <br/>
                 Please settle when possible! 🙏
               </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                     const roommateData = getRoommateById(showRemindModal);
                     const amountOwed = Math.abs(balances[showRemindModal] || 0);
                     const msg = `Hey ${roommateData.name}! 👋\n\nYou owe ₹${amountOwed} for shared expenses.\nPlease settle when possible! 🙏\n\n— via HabiWise Split`;
                     navigator.clipboard.writeText(msg);
                    showToast("Copied!");
                    setShowRemindModal(null);
                  }}
                  className="flex-1 rounded px-4 py-2 border border-slate-700 text-sm font-semibold"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => {
                     const roommateData = getRoommateById(showRemindModal);
                     const amountOwed = Math.abs(balances[showRemindModal] || 0);
                     const msg = `Hey ${roommateData.name}! 👋 You owe ₹${amountOwed} for shared expenses. Please settle when possible! 🙏 — via HabiWise Split`;
                     window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    setShowRemindModal(null);
                  }}
                  className="flex-1 rounded px-4 py-2 bg-emerald-500 text-sm font-semibold text-black"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/25 bg-[#0D1117] p-6 text-slate-100 shadow-2xl shadow-black/40">
            {upiStage === "opening" ? (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">UPI Mock Screen</p>
                <h3 className="mt-3 text-2xl font-black text-white">Opening UPI...</h3>
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
                  <p>Amount: ₹{rentFeePreview.total.toLocaleString()}</p>
                  <p className="mt-2">To: HabiWise Payments</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Payment Status</p>
                <h3 className="mt-3 text-2xl font-black text-white">✅ Payment Successful!</h3>
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
                  <p>Fee collected: ₹{rentFeePreview.processingFee.toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpiModal(false);
                    setUpiStage("preview");
                    if (upiTimerId) {
                      window.clearTimeout(upiTimerId);
                    }
                  }}
                  className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-3 font-black text-black transition hover:bg-emerald-400"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
