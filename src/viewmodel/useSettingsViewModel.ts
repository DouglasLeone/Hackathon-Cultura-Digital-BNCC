
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { NivelEnsino, UserContext } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useSettingsViewModel = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [niveis, setNiveis] = useState<NivelEnsino[]>([]);

    const getUserId = () => localStorage.getItem('user_id') || '';
    const userId = getUserId();

    useEffect(() => {
        const loadSettings = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const ctx = await DIContainer.getUserContextUseCase.execute(userId);
                if (ctx) {
                    setNiveis(ctx.niveis_ensino);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast({ title: "Erro", description: "Falha ao carregar configurações.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, [userId, toast]);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            await DIContainer.updateUserContextUseCase.execute(userId, niveis);
            toast({ title: "Sucesso", description: "Configurações salvas com sucesso." });
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({ title: "Erro", description: "Falha ao salvar configurações.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const toggleNivel = (nivel: NivelEnsino) => {
        // Enforce single selection: replace the array with just the new selection
        setNiveis([nivel]);
    };

    return {
        loading,
        saving,
        niveis,
        toggleNivel,
        handleSave
    };
};
