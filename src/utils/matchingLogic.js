export const calculateMatchScore = (user, candidate) => {
  let score = 0;

  if (user.budget >= candidate.budget) {
    score += 30;
  }

  if (user.city === candidate.city) {
    score += 40;
  }

  if (user.role === candidate.role) {
    score += 30;
  }

  return Math.min(score, 100);
};

export const getTopMatches = (user, candidates) => {
  return candidates
    .map((candidate) => ({
      ...candidate,
      matchScore: calculateMatchScore(user, candidate),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
};
