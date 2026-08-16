export type RoleDto = 
  "Video Editor" | 
  "Social Media Manager" | 
  "Research Writer" | 
  "Graphic Designer" |
  "Frontend Developer" |
  "Backend Developer" |
  "";

export type ApplyFormDto = {
  full_name: string;
  email: string;
  phone_number: string;
  role: RoleDto;
  location: string;
  portfolio: string;
}