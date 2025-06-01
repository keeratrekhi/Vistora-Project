export type InputTypes = "text" | "date" | "email" | "password" | "textarea" | "checkbox" | "number" | "multiselect";

export type MutliSelectOption = {
    label: string,
    value: any,
    isSelected?: boolean
}