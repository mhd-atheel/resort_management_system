import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { ReactNode, useState } from "react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  
  type CustomDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
  };
  
  export function CustomDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className = "",
  }: CustomDialogProps) {
    // Default classes with your custom dark theme color
    const defaultClasses = "dark:bg-[#1E293B]";
    const combinedClasses = `${defaultClasses} ${className}`.trim();
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={combinedClasses}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle className="dark:text-white">{title}</DialogTitle>}
              {description && <DialogDescription className="dark:text-gray-300">{description}</DialogDescription>}
            </DialogHeader>
          )}
  
          <div className="py-4">{children}</div>
  
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }