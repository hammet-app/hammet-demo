import Papa from "papaparse";
import { PreviewStudent } from "./types";

export function parseCSV(
  text: string
): PreviewStudent[] {
  const parsed = Papa.parse<string[]>(
    text.trim(),
    {
      skipEmptyLines: true,
    }
  );

  return parsed.data.map((row, index) => ({
    row: index + 1,

    fullName: row[0]?.trim() ?? "",
    email: row[1]?.trim() ?? "",

    classLevel: row[2]?.trim() ?? "",
    classArm: row[3]?.trim() ?? "",

    parentEmail: row[4]?.trim() ?? "",
    parentPhone: row[5]?.trim() ?? "",

    dateOfBirth: row[6]?.trim() ?? "",

    errors: [],
  }));
}