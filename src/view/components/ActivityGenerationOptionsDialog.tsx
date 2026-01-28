import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/view/components/ui/dialog';
import { Button } from '@/view/components/ui/button';
import { Label } from '@/view/components/ui/label';
import { Input } from '@/view/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ActivityGenerationOptions } from '@/model/services/IAIService';

interface ActivityGenerationOptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (options: ActivityGenerationOptions) => Promise<void>;
    loading?: boolean;
}

export const ActivityGenerationOptionsDialog: React.FC<ActivityGenerationOptionsDialogProps> = ({
    open,
    onOpenChange,
    onGenerate,
    loading = false
}) => {
    const [objectiveCount, setObjectiveCount] = useState(3);
    const [subjectiveCount, setSubjectiveCount] = useState(2);
    const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');

    const handleGenerate = async () => {
        await onGenerate({
            objectiveCount,
            subjectiveCount,
            difficulty
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gerar Atividade Avaliativa</DialogTitle>
                    <DialogDescription>
                        Personalize as opções da atividade que será gerada pela IA.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="objective-count">Questões Objetivas</Label>
                            <Input
                                id="objective-count"
                                type="number"
                                min={0}
                                max={10}
                                value={objectiveCount}
                                onChange={(e) => setObjectiveCount(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subjective-count">Questões Dissertativas</Label>
                            <Input
                                id="subjective-count"
                                type="number"
                                min={0}
                                max={10}
                                value={subjectiveCount}
                                onChange={(e) => setSubjectiveCount(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                        <Select
                            value={difficulty}
                            onValueChange={(value: 'Fácil' | 'Médio' | 'Difícil') => setDifficulty(value)}
                        >
                            <SelectTrigger id="difficulty">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fácil">Fácil - Foco em memorização e compreensão</SelectItem>
                                <SelectItem value="Médio">Médio - Aplicação e análise</SelectItem>
                                <SelectItem value="Difícil">Difícil - Avaliação e criação</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGenerate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerar Atividade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
