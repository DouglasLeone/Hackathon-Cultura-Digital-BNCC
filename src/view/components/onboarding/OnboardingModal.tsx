
import React from 'react';
import { useOnboardingViewModel } from '../../../viewmodel/useOnboardingViewModel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

export const OnboardingModal = () => {
    const { showOnboarding, loading, niveis, toggleNivel, handleSaveLevels } = useOnboardingViewModel();

    if (!showOnboarding && !loading) return null;

    return (
        <Dialog open={showOnboarding}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Bem-vindo à Aula Criativa AI</DialogTitle>
                    <DialogDescription>
                        Para começarmos, precisamos saber: para qual nível de ensino você deseja planejar aulas?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <Checkbox
                            id="fundamental"
                            checked={niveis.includes('Ensino Fundamental')}
                            onCheckedChange={() => toggleNivel('Ensino Fundamental')}
                        />
                        <Label htmlFor="fundamental" className="flex-1 cursor-pointer">
                            Ensino Fundamental
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                        <Checkbox
                            id="medio"
                            checked={niveis.includes('Ensino Médio')}
                            onCheckedChange={() => toggleNivel('Ensino Médio')}
                        />
                        <Label htmlFor="medio" className="flex-1 cursor-pointer">
                            Ensino Médio
                        </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Você pode selecionar ambas as opções e alterar isso depois nas configurações.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveLevels} disabled={niveis.length === 0 || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar e Continuar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
