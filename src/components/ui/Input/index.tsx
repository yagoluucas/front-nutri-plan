import React, { forwardRef, useState } from "react";
import { IInput } from "./interface";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef<HTMLInputElement, IInput>(({ error, className = "", type, ...props }, ref) => {
    const errorClasses = error ? "border-feedback-error-border" : "border-border-default";
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === "password";
    const currentType = isPassword && showPassword ? "text" : type;

    return (
        <div className="flex flex-col w-full">
            <div className="relative">
                <input
                    ref={ref}
                    type={currentType}
                    className={`w-full h-11 rounded-lg border ${errorClasses} bg-surface-default pl-4 ${isPassword ? "pr-12" : "pr-4"} text-body-default text-content-primary placeholder:text-content-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-focus disabled:bg-surface-muted disabled:text-content-disabled shadow-sm transition-all ${className}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && (
                <span className="mt-1 text-caption font-normal text-feedback-error-text animate-in fade-in slide-in-from-top-1">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;