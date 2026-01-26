import { Badge } from "@/view/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/view/components/ui/popover";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { QualityIssue } from "@/usecase/ValidatePedagogicalQualityUseCase";

interface QualityBadgeProps {
    score: number;
    issues: QualityIssue[];
}

export const QualityBadge = ({ score, issues }: QualityBadgeProps) => {
    const getBadgeColor = (score: number) => {
        if (score >= 85) return "bg-green-500 hover:bg-green-600 text-white border-none";
        if (score >= 70) return "bg-yellow-500 hover:bg-yellow-600 text-white border-none";
        return "bg-red-500 hover:bg-red-600 text-white border-none";
    };

    const getIssueIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Badge className={`cursor-pointer transition-all duration-300 shadow-sm gap-1.5 py-1 px-3 ${getBadgeColor(score)}`}>
                    {score >= 85 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    Qualidade: {score}/100
                </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 shadow-xl border-t-4 border-t-primary">
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-lg text-primary">Análise Pedagógica</h4>
                        <div className={`text-2xl font-black ${score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                            {score}%
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {issues.length === 0 ? (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 italic text-sm">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                Nenhum problema pedagógico detectado. Parabéns!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pontos de Atenção:</p>
                                {issues.map((issue, i) => (
                                    <div key={i} className={`flex gap-3 p-2.5 rounded-lg border text-sm transition-colors ${issue.severity === 'critical' ? 'bg-red-50 border-red-100' :
                                            issue.severity === 'warning' ? 'bg-yellow-50 border-yellow-100' :
                                                'bg-blue-50 border-blue-100'
                                        }`}>
                                        <div className="shrink-0 mt-0.5">{getIssueIcon(issue.severity)}</div>
                                        <div className="space-y-1">
                                            <p className="font-medium leading-tight">{issue.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t">
                        <p className="text-[11px] text-muted-foreground leading-snug">
                            Esta análise é baseada em critérios acadêmicos e normas da BNCC. Revise sempre o conteúdo final.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
