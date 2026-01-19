"use client";

import React, { useState, useRef, useEffect, SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CustomSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  error?: string;
  scrollable?: boolean;
  onChange?: (value: string) => void;
  children: React.ReactNode;
}

export const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ className, error, children, value, onChange, scrollable, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    // Get selected option label
    useEffect(() => {
      if (selectRef.current && value) {
        const selectedOption = selectRef.current.querySelector(`option[value="${value}"]`) as HTMLOptionElement;
        if (selectedOption) {
          setSelectedLabel(selectedOption.textContent || "");
        }
      } else {
        setSelectedLabel("");
      }
    }, [value, children]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    const handleOptionClick = (optionValue: string) => {
      if (onChange) {
        onChange(optionValue);
      }
      setIsOpen(false);
    };

    // Get all options (handles both direct options and React.Fragment)
    const options: Array<{ value: string; label: string }> = [];
    const extractOptions = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === 'option') {
            const option = child.props as { value?: string; children?: React.ReactNode };
            // Get label - handle string children and preserve formatting (like └─ prefix)
            let label = "";
            const children = option.children;
            if (typeof children === 'string') {
              label = children;
            } else if (React.isValidElement(children)) {
              // Handle nested elements
              label = String(children);
            } else if (Array.isArray(children)) {
              // Handle array of children (preserve hierarchy)
              label = children.map((c: any) => 
                typeof c === 'string' ? c : (React.isValidElement(c) ? String(c) : String(c))
              ).join('');
            } else {
              label = option.value || "";
            }
            options.push({
              value: option.value || "",
              label: label,
            });
          } else {
            // Handle React.Fragment or nested children
            const props = child.props as { children?: React.ReactNode };
            if (props?.children) {
              extractOptions(props.children);
            }
          }
        }
      });
    };
    
    if (children) {
      extractOptions(children);
    }

    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="w-full">
        <div className="relative" ref={containerRef}>
          {/* Hidden native select for form submission and accessibility */}
          <select
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              selectRef.current = node;
            }}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="sr-only"
            disabled={disabled}
            {...props}
          >
            {children}
          </select>

          {/* Custom dropdown button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2 text-sm bg-background border rounded-md text-left",
              "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-red-500 focus:ring-red-500/20" : "border-border",
              isOpen && "ring-2 ring-foreground/20",
              className
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                selectedOption ? "text-foreground" : "text-muted-foreground"
              )}>
                {selectedOption ? selectedOption.label : "Select an option"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div
              className={cn(
                "absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg",
                "max-h-[250px] overflow-y-auto",
                scrollable && "select-scrollable-dropdown"
              )}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option.value) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer",
                    "first:rounded-t-md last:rounded-b-md",
                    value === option.value && "bg-accent font-medium",
                    "hover:bg-accent"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
