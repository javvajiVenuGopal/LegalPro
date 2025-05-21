import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, htmlFor, className, ...props }) => (
    <label
        htmlFor={htmlFor}
        className={className}
        {...props}
    >
        {children}
    </label>
);

export default Label;