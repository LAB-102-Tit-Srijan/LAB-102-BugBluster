// Equal split — divides amount equally among members
export const equalSplit = (amount, members) => {
  const share = amount / members.length;
  return members.map((m) => ({
    ...m,
    share: parseFloat(share.toFixed(2)),
  }));
};

// Custom split — validates that all amounts add up to total
export const customSplit = (members, totalAmount) => {
  const total = members.reduce((sum, m) => sum + (m.share || 0), 0);
  return {
    members,
    isValid: Math.abs(total - totalAmount) < 0.01, // Allow for floating point errors
    totalEntered: parseFloat(total.toFixed(2)),
  };
};

// Percentage split — validates that all percentages add up to 100
export const percentageSplit = (amount, members) => {
  const totalPct = members.reduce((sum, m) => sum + (m.percentage || 0), 0);
  const isValid = Math.abs(totalPct - 100) < 0.01;

  return {
    members: members.map((m) => ({
      ...m,
      share: isValid ? parseFloat(((m.percentage / 100) * amount).toFixed(2)) : 0,
    })),
    isValid,
    totalPercentage: parseFloat(totalPct.toFixed(2)),
  };
};

// Calculate who owes whom across all expenses for a given user
export const calculateBalances = (expenses, currentUserId) => {
  const balances = {};

  // Initialize all roommates with 0 balance
  const allUserIds = new Set([currentUserId]);
  expenses.forEach((expense) => {
    allUserIds.add(expense.paidBy);
    expense.splits?.forEach((split) => {
      allUserIds.add(split.userId);
    });
  });

  Array.from(allUserIds).forEach((id) => {
    if (id !== currentUserId) {
      balances[id] = 0;
    }
  });

  expenses.forEach((expense) => {
    expense.splits?.forEach((split) => {
      if (split.settled) return; // Skip settled splits

      if (expense.paidBy === currentUserId) {
        // Current user paid, so others owe them
        if (split.userId !== currentUserId) {
          balances[split.userId] = (balances[split.userId] || 0) + split.share;
        }
      } else if (split.userId === currentUserId) {
        // Current user owes the person who paid
        balances[expense.paidBy] = (balances[expense.paidBy] || 0) - split.share;
      }
    });
  });

  return balances;
};

// Get expense breakdowns for a specific expense
export const getExpenseBreakdown = (expense) => {
  return expense.splits?.map((split) => ({
    userId: split.userId,
    share: split.share,
    settled: split.settled,
  })) || [];
};

// Format balance display (positive = they owe you, negative = you owe them)
export const formatBalance = (balance) => {
  const abs = Math.abs(balance);
  const isNegative = balance < 0;
  return {
    amount: abs,
    isNegative,
    text: isNegative ? `You owe ₹${abs.toLocaleString()}` : `Owes you ₹${abs.toLocaleString()}`,
  };
};
