
import { Card, CardHeader, CardContent, CardFooter } from "@/view/components/ui/card";
import { Skeleton } from "@/view/components/ui/skeleton";

export function UnidadeCardSkeleton() {
    return (
        <Card className="h-full flex flex-col border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="pb-3 space-y-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2 w-full">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pb-3 space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </CardFooter>
        </Card>
    );
}
