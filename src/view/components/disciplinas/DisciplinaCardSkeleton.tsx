
import { Card, CardHeader, CardContent, CardFooter } from "@/view/components/ui/card";
import { Skeleton } from "@/view/components/ui/skeleton";

export function DisciplinaCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden border-border/50 bg-card/50">
            <CardHeader className="relative pb-2 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1.5 w-full">
                        <Skeleton className="h-4 w-24 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pb-2 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20 flex gap-2 justify-end">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </CardFooter>
        </Card>
    );
}
