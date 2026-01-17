
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
    variant?: 'default' | 'minimal';
    hideTitle?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
    title,
    initialContent,
    onSave,
    onExport,
    exportLabel = "Exportar",
    variant = 'default',
    hideTitle = false
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

    const containerStyles = variant === 'default'
        ? "bg-white border rounded-lg shadow-sm p-6 w-full"
        : "w-full h-full flex flex-col";

    return (
        <div className={containerStyles}>
            <div className={`flex items-center justify-between mb-4 ${variant === 'default' ? 'border-b pb-4' : ''}`}>
                {!hideTitle && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Conteúdo Gerado</h3>
                        <p className="text-sm text-gray-500">Revise, edite se necessário e exporte o conteúdo</p>
                    </div>
                )}
                {/* Spacer if title is hidden to push buttons to right */}
                {hideTitle && <div />}

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
                    className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed resize-none p-4"
                />
            ) : (
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap flex-1 overflow-y-auto p-1">
                    {content}
                </div>
            )}
        </div>
    );
};
