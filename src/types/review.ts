export type RatingField = "performance" | "readability" | "simplicity" | "reliability" | "learning_value" | "overall";
export type NoteField = "strengths" | "weaknesses" | "use_cases" | "notes";
export type ReviewInput = Record<RatingField, number | null> & Record<NoteField, string>;
export type ImplementationReview = ReviewInput & { implementation_id: number; updated_at: string | null };
