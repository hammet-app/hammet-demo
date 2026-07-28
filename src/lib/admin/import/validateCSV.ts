import {
  CLASS_LEVELS,
  PreviewStudent,
  PreviewError
} from "./types";

const EMAIL =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCSV(
  students: PreviewStudent[],
  availableArms?: string[], 
): PreviewStudent[] {

  const emails = new Map<
    string,
    number
  >();

  students.forEach((student) => {

    const email =
      student.email.toLowerCase();

    emails.set(
      email,
      (emails.get(email) ?? 0) + 1
    );

  });

  return students.map((student) => {
    const errors: PreviewError[] = [];

    if (!student.fullName)
      errors.push({
        message: "Missing full name",
        source: "frontend"
    });

    if (!student.email)
      errors.push({
        message: "Missing email",
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

    if (
      student.email &&
      !EMAIL.test(student.email)
    ) {
      errors.push({
        message: "Invalid student email",
        source: "frontend"
      });
    }

    
    if (
      student.parentEmail &&
      !EMAIL.test(student.parentEmail)
    ) {
      errors.push({
        message: "Invalid parent email",
        source: "frontend"
      });
    }

    if (
      emails.get(
        student.email.toLowerCase()
      )! > 1
    ) {
      errors.push({
        source: "frontend",
        message: "Duplicate email in file"
      });
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