import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

type LabelProps = {
  label: string;
  className?: string;
};

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export const FormLabel: React.FC<LabelProps> = ({
  label,
  className
}: LabelProps) => {
  return (
    <label className={cn(labelVariants(), className)}>
      {label}
    </label>
  );
};
