import React from "react";

export interface ILabel extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export default function Label({ children, className = "", ...props }: ILabel) {
    return (
        <label
            className={`text-label font-medium text-content-primary ${className}`}
            {...props}
        >
            {children}
        </label>
    );
}
