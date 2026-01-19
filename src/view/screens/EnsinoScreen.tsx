
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useEnsinoViewModel } from '../../viewmodel/useEnsinoViewModel';
import { Book, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnsinoScreen = () => {
    const { loading, areas } = useEnsinoViewModel();
    const navigate = useNavigate();

    if (loading) {
        return <AppLayout><div>Carregando...</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">Ensino</h1>
                    <p className="text-muted-foreground mt-2">
                        Selecione uma Área do Conhecimento para visualizar as disciplinas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.length > 0 ? (
                        areas.map((area) => (
                            <Card
                                key={area}
                                className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                                onClick={() => navigate(`/disciplinas?area=${encodeURIComponent(area)}`)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold">{area}</CardTitle>
                                    <Book className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                        <span>Ver disciplinas</span>
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            Nenhuma área de conhecimento disponível. Verifique suas configurações de nível de ensino.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default EnsinoScreen;
