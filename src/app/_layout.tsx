
import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {children}
            </TooltipProvider>
        </QueryClientProvider>
    );
}
