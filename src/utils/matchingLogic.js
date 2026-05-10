/**
 * Calculate compatibility score between user preferences and a candidate
 * Scoring:
 *  - Same sleep schedule: +25 pts
 *  - Same cleanliness: +20 pts
 *  - Same food preference: +20 pts
 *  - Same social habits: +20 pts
 *  - Budget within ₹2000: +15 pts
 *  - Each shared interest: +10 pts (max 2 interests = +20)
 * Total base: 120 pts → normalize to 100%
 */
export function calculateCompatibility(userPrefs, candidate) {
  let score = 0;
  const maxScore = 120;

  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const isSame = (left, right) => normalizeValue(left) === normalizeValue(right);

  // Sleep schedule match (+25)
  if (isSame(userPrefs.sleepSchedule, candidate.sleepSchedule)) {
    score += 25;
  }

  // Cleanliness match (+20)
  if (isSame(userPrefs.cleanliness, candidate.cleanliness)) {
    score += 20;
  }

  // Food preference match (+20)
  if (isSame(userPrefs.foodPreference, candidate.foodPreference)) {
    score += 20;
  }

  // Social habits match (+20)
  if (isSame(userPrefs.socialHabits, candidate.socialHabits)) {
    score += 20;
  }

  // Budget within ₹2000 (+15)
  const budgetDiff = Math.abs(userPrefs.budget - candidate.budget);
  if (budgetDiff <= 2000) {
    score += 15;
  }

  // Shared interests (+10 per interest, max 2 = +20)
  if (userPrefs.interests && userPrefs.interests.length > 0) {
    const candidateInterests = (candidate.interests || []).map((interest) => normalizeValue(interest));
    const sharedInterests = userPrefs.interests.filter((interest) =>
      candidateInterests.includes(normalizeValue(interest))
    );
    const interestBonus = Math.min(sharedInterests.length * 10, 20);
    score += interestBonus;
  }

  // Normalize to 100% (0-120 → 0-100)
  let compatibility = Math.round((score / maxScore) * 100);

  const myExamPrep = Array.isArray(userPrefs.examPrep)
    ? userPrefs.examPrep.find((item) => item !== "None") || ""
    : userPrefs.examPrep || "";
  const candidateExamPrep = candidate.examPrep || "";

  // Situation matching (bonus points)
  if (userPrefs.situation && isSame(userPrefs.situation, candidate.situation)) {
    compatibility += 10;
  }

  if (
    userPrefs.college &&
    candidate.college &&
    userPrefs.college.toLowerCase() === candidate.college.toLowerCase()
  ) {
    compatibility += 15;
  }

  if (myExamPrep && candidateExamPrep && isSame(myExamPrep, candidateExamPrep)) {
    compatibility += 10;
  }

  if (userPrefs.stayDuration && candidate.stayDuration && isSame(userPrefs.stayDuration, candidate.stayDuration)) {
    compatibility += 10;
  }

  return Math.min(compatibility, 100);
}

/**
 * Determine conflict risk based on differences
 */
export function getConflictRisk(userPrefs, candidate) {
  let conflicts = 0;
  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");

  // Count mismatches
  if (normalizeValue(userPrefs.sleepSchedule) !== normalizeValue(candidate.sleepSchedule)) conflicts++;
  if (normalizeValue(userPrefs.cleanliness) !== normalizeValue(candidate.cleanliness)) conflicts++;
  if (normalizeValue(userPrefs.foodPreference) !== normalizeValue(candidate.foodPreference)) conflicts++;
  if (normalizeValue(userPrefs.socialHabits) !== normalizeValue(candidate.socialHabits)) conflicts++;

  if (conflicts === 0) return "Low";
  if (conflicts === 1 || conflicts === 2) return "Medium";
  return "High";
}

/**
 * Get shared interests
 */
export function getSharedInterests(userPrefs, candidate) {
  if (!userPrefs.interests || userPrefs.interests.length === 0) return [];
  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const candidateInterests = (candidate.interests || []).map((interest) => normalizeValue(interest));
  return userPrefs.interests.filter((interest) =>
    candidateInterests.includes(normalizeValue(interest))
  );
}

function getSituationTag(userPrefs, candidate) {
  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const myExamPrep = Array.isArray(userPrefs.examPrep)
    ? userPrefs.examPrep.find((item) => item !== "None") || ""
    : userPrefs.examPrep || "";

  if (
    userPrefs.college &&
    candidate.college &&
    userPrefs.college.toLowerCase() === candidate.college.toLowerCase() &&
    userPrefs.branch
  ) {
    return `Fellow ${userPrefs.branch} student 🎓`;
  }

  if (myExamPrep && candidate.examPrep && normalizeValue(myExamPrep) === normalizeValue(candidate.examPrep)) {
    return `${myExamPrep} buddy 📚`;
  }

  if (userPrefs.situation && candidate.situation && normalizeValue(userPrefs.situation) === normalizeValue(candidate.situation)) {
    if (candidate.situation === "Intern") return "Fellow intern 💼";
    if (candidate.situation === "Student") return "Fellow student 🎓";
    if (candidate.situation === "Freelancer") return "Fellow freelancer 💻";
    if (candidate.situation === "Employee") return "Fellow employee 🏢";
  }

  if (userPrefs.stayDuration && candidate.stayDuration && normalizeValue(userPrefs.stayDuration) === normalizeValue(candidate.stayDuration)) {
    return "Short-stay match ⏳";
  }

  return "Community vibe match 🤝";
}

/**
 * Get top matches sorted by compatibility score
 */
export function getTopMatches(userPrefs, candidates) {
  return candidates
    .map((candidate) => ({
      ...candidate,
      compatibility: calculateCompatibility(userPrefs, candidate),
      conflictRisk: getConflictRisk(userPrefs, candidate),
      sharedInterests: getSharedInterests(userPrefs, candidate),
      situationTag: getSituationTag(userPrefs, candidate),
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 4); // Return top 4 matches
}
