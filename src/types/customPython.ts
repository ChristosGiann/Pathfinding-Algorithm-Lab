export interface PythonValidationResult {
  valid: boolean;
  stage: "static";
  errors: { code: string; message: string; line: number | null; column: number | null }[];
}
