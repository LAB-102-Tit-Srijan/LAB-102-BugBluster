/**
 * Calculate compatibility score between user preferences and a candidate
 * Scoring Formula:
 *  - Same sleep schedule: +25 pts
 *  - Same cleanliness: +20 pts
 *  - Same food preference: +20 pts
 *  - Same social habits: +20 pts
 *  - Budget within ₹2000: +15 pts
 *  - Shared interests (1+): +5 pts, (2+): +10 pts
 *  - Same situation: +10 pts
 *  - Same stay duration: +10 pts
 * Total max: 100 pts (capped)
 */
export function calculateCompatibility(userPrefs, candidate) {
  let score = 0;

  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const isSame = (left, right) => normalizeValue(left) === normalizeValue(right);

  // Core Parameters: Sleep schedule match (+25)
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
  const budgetDiff = Math.abs((userPrefs.budget || 0) - (candidate.budget || 0));
  if (budgetDiff <= 2000) {
    score += 15;
  }

  // Shared interests bonus
  if (userPrefs.interests && userPrefs.interests.length > 0) {
    const candidateInterests = (candidate.interests || []).map((interest) => normalizeValue(interest));
    const sharedInterests = userPrefs.interests.filter((interest) =>
      candidateInterests.includes(normalizeValue(interest))
    );
    // Shared interests: 1+ → +5, 2+ → +10
    if (sharedInterests.length >= 2) {
      score += 10;
    } else if (sharedInterests.length >= 1) {
      score += 5;
    }
  }

  // Same situation bonus (+10)
  if (userPrefs.situation && candidate.situation && isSame(userPrefs.situation, candidate.situation)) {
    score += 10;
  }

  // Same stay duration bonus (+10)
  if (userPrefs.stayDuration && candidate.stayDuration && isSame(userPrefs.stayDuration, candidate.stayDuration)) {
    score += 10;
  }

  // Cap at 100 and return as percentage
  return Math.min(score, 100);
}

/**
 * Determine conflict risk based on parameter mismatches
 * Counts conflicts in core areas:
 *  - Sleep schedule mismatch
 *  - Cleanliness mismatch
 *  - Social habits mismatch
 *
 * Returns: "Low" (0-1 conflicts), "Medium" (2 conflicts), "High" (3+ conflicts)
 */
export function getConflictRisk(userPrefs, candidate) {
  let conflicts = 0;
  const normalizeValue = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  const isSame = (left, right) => normalizeValue(left) === normalizeValue(right);

  // Count core mismatches
  if (!isSame(userPrefs.sleepSchedule, candidate.sleepSchedule)) {
    conflicts++;
  }
  if (!isSame(userPrefs.cleanliness, candidate.cleanliness)) {
    conflicts++;
  }
  if (!isSame(userPrefs.socialHabits, candidate.socialHabits)) {
    conflicts++;
  }

  // Return risk level based on conflict count
  if (conflicts === 0 || conflicts === 1) {
    return "Low";
  }
  if (conflicts === 2) {
    return "Medium";
  }
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
