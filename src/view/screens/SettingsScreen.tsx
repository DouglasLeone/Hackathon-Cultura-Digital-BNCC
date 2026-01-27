
import React from 'react';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/view/components/ui/card';
import { Button } from '@/view/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/view/components/ui/radio-group"
import { Label } from '@/view/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useSettingsViewModel } from '@/viewmodel/useSettingsViewModel';
import { NivelEnsino } from '@/model/entities/BNCC';

const SettingsScreen = () => {
    const { loading, saving, niveis, toggleNivel, handleSave } = useSettingsViewModel();

    if (loading) {
        return <AppLayout><div>Carregando...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">Configurações</h1>
                    <p className="text-muted-foreground mt-2">
                        Personalize sua experiência pedagógica.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nível de Ensino</CardTitle>
                        <CardDescription>
                            Selecione os níveis de ensino para os quais você planeja aulas. Isso ajustará o contexto da IA.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <RadioGroup
                            value={niveis.length > 0 ? niveis[0] : ""}
                            onValueChange={(value) => toggleNivel(value as NivelEnsino)}
                            className="space-y-4"
                        >
                            <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="Ensino Fundamental" id="fundamental" />
                                <Label htmlFor="fundamental" className="flex-1 cursor-pointer">
                                    Ensino Fundamental
                                    <span className="block text-xs font-normal text-muted-foreground mt-1">
                                        Anos iniciais e finais (1º ao 9º ano).
                                    </span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-4 rounded-md">
                                <RadioGroupItem value="Ensino Médio" id="medio" />
                                <Label htmlFor="medio" className="flex-1 cursor-pointer">
                                    Ensino Médio
                                    <span className="block text-xs font-normal text-muted-foreground mt-1">
                                        Formação geral básica e itinerários (1ª a 3ª série).
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>

                        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default SettingsScreen;
