import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, error, ...props }) => {
    return (
        <div className="textarea-container">
            {label && <label className="textarea-label">{label}</label>}
            <textarea className={`textarea ${error ? 'textarea-error' : ''}`} {...props} rows={5} cols={70}/>
            {error && <span className="textarea-error-message">{error}</span>}
        </div>
    );
};

export default Textarea;