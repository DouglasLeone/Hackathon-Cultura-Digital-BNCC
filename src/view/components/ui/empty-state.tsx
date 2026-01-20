
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500",
            "bg-muted/30 rounded-xl border-dashed border-2 border-muted-foreground/20",
            "min-h-[300px] gap-4",
            className
        )}>
            {Icon && (
                <div className="bg-background p-4 rounded-full shadow-sm ring-1 ring-border mb-2">
                    <Icon className="w-8 h-8 text-muted-foreground/70" />
                </div>
            )}
            <div className="space-y-1 max-w-sm">
                <h3 className="text-xl font-semibold text-foreground/80">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="mt-4 pt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
