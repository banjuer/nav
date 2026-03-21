import { useState, useRef } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export interface ComboOption {
    value: string;
    label: string;
}

interface ComboBoxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboOption[];
    placeholder?: string;
    onEnter?: () => void;
}

export function ComboBox({ value, onChange, options, placeholder = '请选择或输入', onEnter }: ComboBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = query === ''
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
        );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onChange(e.target.value);
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    const handleBlur = (e: React.FocusEvent) => {
        // 延迟关闭，让点击选项的事件能先触发
        setTimeout(() => {
            if (!e.relatedTarget?.closest('.combobox-dropdown')) {
                setIsOpen(false);
            }
        }, 150);
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onEnter) {
                onEnter();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            inputRef.current?.focus();
        }
    };

    return (
        <div className="relative combobox-container">
            <input
                ref={inputRef}
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={value}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2"
                onClick={handleToggle}
                tabIndex={-1}
            >
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </button>
            
            {isOpen && (
                <div 
                    className="combobox-dropdown absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600"
                >
                    {filteredOptions.length === 0 ? (
                        <div className="relative cursor-default select-none py-2 px-3 text-gray-500 dark:text-gray-400">
                            无匹配选项
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`relative cursor-pointer select-none py-2 pl-8 pr-3 hover:bg-blue-500 hover:text-white ${
                                    option.value === value 
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-100' 
                                        : 'text-gray-900 dark:text-gray-100'
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(option.value);
                                }}
                            >
                                <span className={`block truncate ${option.value === value ? 'font-medium' : 'font-normal'}`}>
                                    {option.label}
                                </span>
                                {option.value === value && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-blue-500 hover:text-white">
                                        <CheckIcon className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
