export const calculateTrustScore = (user = {}) => {
  let score = 0;

  if (user.profileComplete) score += 20;
  if (user.emailVerified) score += 10;
  if (user.aadhaarUploaded) score += 20;
  if (user.idUploaded) score += 15;
  if (Number(user.roommateReviews) > 0) score += 20;
  if (user.rentPaidOnTime) score += 15;

  return Math.min(score, 100);
};

export const getTrustTier = (score) => {
  if (score <= 40) {
    return { key: "basic", label: "Basic", icon: "🥉", badgeClass: "border-slate-500/40 bg-slate-500/15 text-slate-300", benefit: "Complete profile to unlock deposit benefits" };
  }

  if (score <= 70) {
    return { key: "trusted", label: "Trusted", icon: "🥈", badgeClass: "border-slate-300/40 bg-slate-300/15 text-slate-200", benefit: "✅ You qualify for 50% deposit waiver!" };
  }

  return { key: "elite", label: "Elite", icon: "🥇", badgeClass: "border-amber-400/40 bg-amber-500/15 text-amber-200", benefit: "✅ You qualify for Zero Deposit properties!" };
};

export const getTrustImprovementItems = (user = {}) => {
  const items = [];

  if (!user.aadhaarUploaded) {
    items.push({ key: "aadhaar", label: "Upload Aadhaar +20 pts", action: "Upload", points: 20 });
  }

  if (!user.idUploaded) {
    items.push({ key: "college-id", label: "Upload College ID +15 pts", action: "Upload", points: 15 });
  }

  if (!(Number(user.roommateReviews) > 0)) {
    items.push({ key: "review", label: "Get roommate review +20pts", action: "Request", points: 20 });
  }

  if (!user.rentPaidOnTime) {
    items.push({ key: "rent-history", label: "Add rent history +15 pts", action: "Add", points: 15 });
  }

  return items;
};
