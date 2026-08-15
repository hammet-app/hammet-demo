import { ApplyForm, Role } from "./types";
import { ApplyFormDto, RoleDto } from "./types-dto";



export function fromApplyForm(model: ApplyForm): ApplyFormDto {
  return {
    full_name: model.fullName,
    email: model.email,
    phone_number: model.phoneNumber,
    role: model.role,
    location: model.location,
    portfolio: model.portfolio
  }
}