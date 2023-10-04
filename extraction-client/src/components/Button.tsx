import classNames from "classnames";
import { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  type?: "primary" | "secondary" | "tab";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FunctionComponent<ButtonProps> = ({
  type = "primary",
  disabled = false,
  onClick,
  children,
  className,
}) => {
  const buttonClassName = classNames(
    "my-4 rounded-md px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-80",
    {
      block: type === "primary" || type === "secondary",
      "bg-indigo-600 hover:bg-indigo-500": type === "primary",
      "bg-gray-400 hover:bg-gray-500": type === "secondary",
    },
    className
  );

  return (
    <button disabled={disabled} onClick={onClick} className={buttonClassName}>
      {children}
    </button>
  );
};
