export type PreviewError = {
    source: "frontend" | "backend";
    message: string;
  }

export type PreviewStudent = {
  row: number;

  fullName: string;
  email: string;

  classLevel: string;
  classArm: string;

  parentEmail?: string;
  parentPhone?: string;

  dateOfBirth: string;
  gender: string;

  errors: PreviewError[];
};

export const CLASS_LEVELS = [
  "JSS1",
  "JSS2",
  "JSS3",
  "SSS1",
  "SSS2",
  "SSS3",
  "summer",
] as const;