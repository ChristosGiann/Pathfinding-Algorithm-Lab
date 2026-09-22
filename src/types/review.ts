export const ratingLabels = {
  performance: "Απόδοση", readability: "Αναγνωσιμότητα", simplicity: "Απλότητα",
  reliability: "Αξιοπιστία", learning_value: "Εκπαιδευτική αξία", overall: "Συνολική αξιολόγηση",
} as const;
export const noteLabels = {
  strengths: "Δυνατά σημεία", weaknesses: "Αδύνατα σημεία", use_cases: "Περιπτώσεις χρήσης", notes: "Σημειώσεις",
} as const;
export type ReviewInput = Record<keyof typeof ratingLabels, number | null> & Record<keyof typeof noteLabels, string>;
export type ImplementationReview = ReviewInput & { implementation_id: number; updated_at: string | null };
