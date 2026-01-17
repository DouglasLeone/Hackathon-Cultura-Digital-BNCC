
import { useParams } from 'react-router-dom';
import { useDisciplinaDetailViewModel } from '../../viewmodel/useDisciplinaDetailViewModel';
import { AppLayout } from '@/view/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';

const DisciplinaDetailScreen = () => {
    const { id } = useParams<{ id: string }>();
    const { disciplina, loading } = useDisciplinaDetailViewModel(id || '');

    if (loading) {
        return <AppLayout><div>Loading...</div></AppLayout>;
    }

    if (!disciplina) {
        return <AppLayout><div>Disciplina não encontrada.</div></AppLayout>;
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold edu-gradient-text">{disciplina.nome}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{disciplina.serie}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Unidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Em breve</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Materiais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Em breve</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default DisciplinaDetailScreen;
