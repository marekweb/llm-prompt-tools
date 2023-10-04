import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export const Card: React.FunctionComponent<CardProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`max-w-lg mx-auto rounded-lg py-4 px-8 my-4 border border-gray-200 bg-white shadow-md ${className}`}
  >
    {children}
  </div>
);
