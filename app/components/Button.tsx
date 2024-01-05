import clsx from "clsx";
import React, { ReactElement } from "react";

export default function Button({
  children,
  className,
  type = "primary",
  ...restProps
}: {
  children?: React.ReactNode;
  className?: string;
  type?: "primary" | "secondary" | "tertiary";
}): ReactElement<HTMLButtonElement> {
  return (
      <button
        className={clsx(
          "",
          type === "primary" &&
            "bg-secondary text-primary px-6 py-2 rounded-lg transition-all hover:bg-transparent hover:text-secondary border border-secondary hover:scale-105",
          type === "secondary" &&
            "rounded border border-secondary px-9 py-2 transition-all hover:bg-primary hover:border-primary hover:text-secondary",
          type === "tertiary" && "underline",
          className
        )}
        {...restProps}
      >
        {children}
      </button>
  );
}
