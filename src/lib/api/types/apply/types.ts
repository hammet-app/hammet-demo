export type Role = 
  "Video Editor" | 
  "Social Media Manager" | 
  "Research Writer" | 
  "Graphic Designer" |
  "Frontend Developer" |
  "Backend Developer" |
  "";

export type ApplyForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  location: string;
  portfolio: string;
}