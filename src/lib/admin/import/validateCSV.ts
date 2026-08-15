import {
  CLASS_LEVELS,
  PreviewStudent,
  PreviewError
} from "./types";

const EMAIL =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UPPER_TIERS = ["premier", "global"]

export function validateCSV(
  tier: string,
  students: PreviewStudent[],
  availableArms?: string[], 
): PreviewStudent[] {

  return students.map((student) => {
    const errors: PreviewError[] = [];

    if (!student.fullName)
      errors.push({
        message: "Missing full name",
        source: "frontend"
    });

    if (!student.classLevel)
      errors.push({
        message:"Missing class level",
        source: "frontend"
      });

    if (!student.dateOfBirth)
       errors.push({
        message: "Missing date of birth",
        source: 'frontend'
      });

    if (
      student.classLevel &&
      !CLASS_LEVELS.includes(
        student.classLevel as
        (typeof CLASS_LEVELS)[number]
      )
    ) {
      errors.push({
        message: "Invalid class level",
        source: "frontend"
      });
    }

    if (
      availableArms &&
      availableArms.length &&
      student.classArm &&
      !availableArms.includes(
        student.classArm
      )
    ) {
      errors.push({
        message:"Invalid class arm",
        source: "frontend"
      });
    }
    
    if (UPPER_TIERS.includes(tier)) {
      if (
        student.parentEmail &&
        !EMAIL.test(student.parentEmail)
      ) {
        errors.push({
          message: "Invalid parent email",
          source: "frontend"
        });
      }
    }

    if (
      student.gender && 
      !["M", "F"].includes(student.gender)
    ) {
      errors.push({
        source: "frontend",
        message: "Gender must be M or F"
      })
    }


    return {
      ...student,
      errors,
    };

  });

}