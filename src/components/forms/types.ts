import { RegisterSchoolRequest, RegisterStudentRequest } from "@/lib/api/types";

export const TIER_OPTIONS: SelectOption<RegisterSchoolRequest["tier"]>[] = [
  {
    value: "pilot",
    label: "Pilot",
  },
  {
    value: "summer",
    label: "Summer",
  },
  {
    value: "academy",
    label: "Academy",
  },
  {
    value: "premier",
    label: "Premier",
  },
  {
    value: "global",
    label: "Global"
  },
]

export const LEVEL_OPTIONS: SelectOption<RegisterStudentRequest["classLevel"]>[] = [
 { 
    value:"JSS1",
    label: "JSS1"
 },
 {
    value: "JSS2",
    label: "JSS2",
 },
 {
    value: "JSS3",
    label: "JSS3",
 },
 {
    value: "SSS1",
    label: "SSS1",
 },
 {
    value: "SSS2",
    label: "SSS2",
 },
 {
    value:  "SSS3",
    label:  "SSS3"
 }
]

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ComponentType<{
    className?:string;
  }>;
}