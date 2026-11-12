import { classNames } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primario" | "secundario" | "peligro";
  children: React.ReactNode;
}

export default function Button({ variant = "primario", children, className, ...props }: ButtonProps) {
  return (
    <button
      className={classNames(
        "px-4 py-2 rounded-lg font-semibold transition-colors",
        variant === "primario" && "bg-primario text-white hover:bg-blue-800",
        variant === "secundario" && "bg-secundario text-black hover:bg-yellow-500",
        variant === "peligro" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}