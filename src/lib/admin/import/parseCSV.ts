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

    classLevel: row[1]?.trim() ?? "",
    classArm: row[2]?.trim() ?? "",

    dateOfBirth: row[3]?.trim() ?? "",
    gender: row[4]?.trim() ?? "",

    parentEmail: row[5]?.trim() ?? "",
    parentPhone: row[6]?.trim() ?? "",

    errors: [],
  }));
}