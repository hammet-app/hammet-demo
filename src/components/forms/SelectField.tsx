import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils/utils"
import { SelectOption } from "./types";



type SelectFieldProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onChange(value: T): void;
};

export function SelectField<T extends string>({
  id, label, value, options, placeholder = "Select an option",
  error, disabled, onChange
}: SelectFieldProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-text-primary"
      >
        {label}
      </label>
      
      <Select
        value={value}
        onValueChange={(value) =>
          onChange(value as T)
        }
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={placeholder}
          />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) =>{
            const Icon = option.icon;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {Icon && (
                  <Icon className="size-4" />
                )}
                {option.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}