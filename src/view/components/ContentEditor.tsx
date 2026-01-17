
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Edit, Save, Download, X } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface ContentEditorProps {
    title: string;
    initialContent: string;
    onSave: (content: string) => Promise<void>;
    onExport: () => void;
    exportLabel?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
    title,
    initialContent,
    onSave,
    onExport,
    exportLabel = "Exportar"
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Reset content if initialContent changes (e.g. switching items)
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(content);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível salvar as alterações.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border rounded-lg shadow-sm p-6 w-full">
            <div className="flex items-center justify-between mb-4 border-b pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Conteúdo Gerado</h3>
                    <p className="text-sm text-gray-500">Revise, edite se necessário e exporte o conteúdo</p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" onClick={() => {
                                setIsEditing(false);
                                setContent(initialContent); // Cancel edits
                            }}>
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? "Salvando..." : "Salvar"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </Button>
                            <Button variant="secondary" onClick={onExport}>
                                <Download className="w-4 h-4 mr-2" />
                                {exportLabel}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm leading-relaxed"
                />
            ) : (
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap min-h-[300px]">
                    {content}
                </div>
            )}
        </div>
    );
};
