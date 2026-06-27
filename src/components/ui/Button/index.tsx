import React, { forwardRef } from "react";

export interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    children: React.ReactNode;
}

const variantClasses = {
    primary: "bg-action-primary border border-transparent h-11 px-6 text-button font-semibold text-action-primary-text hover:bg-action-primary-hover active:bg-action-primary-pressed focus-visible:ring-action-primary-focus disabled:bg-action-primary-disabled disabled:text-content-disabled shadow-sm hover:shadow-md",
    secondary: "bg-action-secondary border border-transparent h-11 px-6 text-button font-semibold text-action-secondary-text hover:bg-action-secondary-hover active:bg-action-secondary-pressed focus-visible:ring-action-secondary-focus disabled:bg-action-secondary-disabled disabled:text-content-disabled shadow-sm hover:shadow-md",
    ghost: "bg-action-ghost-bg border border-transparent h-11 px-4 text-button font-semibold text-action-ghost-text hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover active:bg-action-ghost-bg-pressed focus-visible:ring-action-ghost-focus",
    destructive: "bg-action-destructive border border-transparent h-11 px-6 text-button font-semibold text-action-destructive-text hover:bg-action-destructive-hover active:bg-action-destructive-pressed focus-visible:ring-action-destructive-focus disabled:bg-action-destructive-disabled disabled:text-content-disabled shadow-sm hover:shadow-md"
};

const Button = forwardRef<HTMLButtonElement, IButton>(({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={`inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
