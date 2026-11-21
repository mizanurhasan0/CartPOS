import React from 'react';
import { Arwlfcle } from '@/assets/SvgComponents';
import Button from '../Button/Button';

/**
 * Centered page shell for create/edit screens: [Back] Title, then the form card(s).
 * @param {string} title
 * @param {function} [onBack]  Shows a Back button when provided.
 * @param {string} [width]     Tailwind max-width class, default 'max-w-2xl'.
 */
export default function FormPage({ title, onBack, width = 'max-w-2xl', children }) {
    return (
        <div className={`mx-auto w-full ${width}`}>
            <div className="flex items-center gap-3 mb-3">
                {onBack ? (
                    <Button style="small" className="flex items-center shrink-0 !text-sm !py-1.5" onClick={onBack}>
                        <Arwlfcle className="mr-1.5" />
                        Back
                    </Button>
                ) : null}
                <h1 className="text-lg font-semibold text-primary truncate">{title}</h1>
            </div>
            {children}
        </div>
    );
}

/** Bordered card that renders a <form>. Autofill is disabled so browsers don't inject saved logins. */
export function FormCard({ children, className = '', ...props }) {
    return (
        <form autoComplete="off" noValidate={false} className={`rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm space-y-4 ${className}`} {...props}>
            {children}
        </form>
    );
}

/** Responsive 1 / 2 column field grid. Use className="sm:col-span-2" on a child to span both columns. */
export function FormGrid({ children, className = '' }) {
    return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 ${className}`}>{children}</div>;
}

/** Action row: stacked full-width on phones, right-aligned from sm. */
export function FormActions({ children }) {
    return <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1 [&>button]:w-full sm:[&>button]:w-auto">{children}</div>;
}
