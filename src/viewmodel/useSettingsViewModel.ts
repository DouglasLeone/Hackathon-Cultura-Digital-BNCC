
import { useState, useEffect } from 'react';
import { useDI } from '../di/useDI';
import { useToast } from '../view/components/ui/use-toast';
import { NivelEnsino } from '../model/entities/BNCC';

export const useSettingsViewModel = () => {
    const { getUserContextUseCase, updateUserContextUseCase } = useDI();
    const [selectedLevels, setSelectedLevels] = useState<NivelEnsino[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            const userId = localStorage.getItem('user_id');
            if (userId) {
                try {
                    const ctx = await getUserContextUseCase.execute(userId);
                    if (ctx) {
                        setSelectedLevels(ctx.niveis_ensino);
                    }
                } catch (error) {
                    console.error('Error loading settings:', error);
                }
            }
            setLoading(false);
        };
        loadSettings();
    }, [getUserContextUseCase]);

    const toggleNivel = (level: string) => {
        // Enforce single selection logic if using RadioGroup as per View
        setSelectedLevels([level as NivelEnsino]);
    };

    const handleSave = async () => {
        setSaving(true);
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            setSaving(false);
            return;
        }

        try {
            await updateUserContextUseCase.execute(userId, selectedLevels);
            toast({
                title: "Sucesso",
                description: "Configurações salvas com sucesso.",
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Erro",
                description: "Erro ao salvar configurações.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return {
        niveis: selectedLevels,
        loading,
        saving,
        toggleNivel,
        handleSave
    };
};
