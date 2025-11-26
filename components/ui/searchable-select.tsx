"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface Option {
    label: string;
    value: string;
    description?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Selecione...",
    disabled = false,
    className = "",
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-2 text-left bg-white border rounded-lg transition-colors ${disabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : "hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                    } ${open ? "ring-2 ring-blue-500 border-transparent" : ""}`}
            >
                <span className={`block truncate ${!selectedOption ? "text-gray-500" : "text-gray-900"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronsUpDown className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col animate-scale-in">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 scrollbar-thin">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                Nenhum resultado encontrado.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${value === option.value
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <div className="flex flex-col items-start text-left">
                                        <span>{option.label}</span>
                                        {option.description && (
                                            <span className="text-xs text-gray-400 font-normal">
                                                {option.description}
                                            </span>
                                        )}
                                    </div>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-blue-600 ml-2" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
