import React, { forwardRef } from "react";

const baseClasses = [
    "inline-flex items-center justify-center",
    "rounded-md border border-transparent",
    "h-11 text-button font-semibold",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "enabled:cursor-pointer disabled:cursor-not-allowed",
    "disabled:text-content-disabled disabled:shadow-none",
].join(" ");

const solidButtonClasses = "px-6 shadow-sm enabled:hover:shadow-md";

const variantClasses = {
    primary: [
        solidButtonClasses,
        "bg-action-primary text-action-primary-text",
        "hover:bg-action-primary-hover",
        "active:bg-action-primary-pressed",
        "focus-visible:ring-action-primary-focus",
        "disabled:bg-action-primary-disabled",
    ].join(" "),

    secondary: [
        solidButtonClasses,
        "bg-action-secondary text-action-secondary-text",
        "hover:bg-action-secondary-hover",
        "active:bg-action-secondary-pressed",
        "focus-visible:ring-action-secondary-focus",
        "disabled:bg-action-secondary-disabled",
    ].join(" "),

    ghost: [
        "px-4",
        "bg-action-ghost-bg text-action-ghost-text",
        "hover:bg-action-ghost-bg-hover hover:text-action-ghost-text-hover",
        "active:bg-action-ghost-bg-pressed",
        "focus-visible:ring-action-ghost-focus",
        "disabled:bg-transparent",
    ].join(" "),

    destructive: [
        solidButtonClasses,
        "bg-action-destructive text-action-destructive-text",
        "hover:bg-action-destructive-hover",
        "active:bg-action-destructive-pressed",
        "focus-visible:ring-action-destructive-focus",
        "disabled:bg-action-destructive-disabled",
    ].join(" "),

    details: [
        "px-4",
        "bg-transparent text-action-primary",
        "hover:bg-action-ghost-bg-hover",
        "active:bg-action-ghost-bg-pressed",
        "focus-visible:ring-action-primary-focus",
        "disabled:bg-transparent",
    ].join(" "),
} as const;

export type ButtonVariant = keyof typeof variantClasses;

export interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, IButton>(
    (
        {
            variant = "primary",
            className = "",
            children,
            type = "button",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;