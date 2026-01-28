import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Edit, Save, Download, X } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { RichTextEditor } from './RichTextEditor';
import { MarkdownViewer } from './MarkdownViewer';

interface ContentEditorProps {
    title: string;
    initialContent: string;
    onSave: (content: string) => Promise<void>;
    onExport?: () => void;
    exportLabel?: string;
    variant?: 'default' | 'minimal';
    hideTitle?: boolean;
    useRichEditor?: boolean; // New prop to enable rich text editor
}

// Helper to detect if content is Markdown vs HTML
const isMarkdown = (content: string): boolean => {
    // Simple heuristic: if it doesn't start with HTML tags and contains markdown patterns
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);
    const hasMarkdown = /^#{1,6}\s|^\*\*|^-\s|^\d+\.\s|^\>|```/m.test(content);
    return !hasHtmlTags && hasMarkdown;
};

export const ContentEditor: React.FC<ContentEditorProps> = ({
    title,
    initialContent,
    onSave,
    onExport,
    exportLabel = "Exportar",
    variant = 'default',
    hideTitle = false,
    useRichEditor = true // Default to true for rich editing
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Detect if current content is markdown
    const contentIsMarkdown = isMarkdown(content);

    // Reset content if initialContent changes (e.g. switching items)
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(content);
            setIsEditing(false);
            toast({
                title: "Salvo com sucesso",
                description: "Suas alterações foram salvas.",
            });
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
        : "w-full flex-1 min-h-0 flex flex-col";

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
                            {onExport && (
                                <Button variant="secondary" onClick={onExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    {exportLabel}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content Display/Editor */}
            {isEditing ? (
                // When editing, use textarea for Markdown or RichEditor for HTML
                contentIsMarkdown ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed resize-none p-4 border rounded-md w-full"
                        placeholder="Digite o conteúdo em Markdown..."
                    />
                ) : useRichEditor ? (
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        editable={true}
                        className="flex-1"
                    />
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed resize-none p-4 border rounded-md"
                    />
                )
            ) : (
                // When viewing, render Markdown beautifully or use RichEditor for HTML
                contentIsMarkdown ? (
                    <div className="flex-1 overflow-y-auto max-h-[600px]">
                        <MarkdownViewer content={content} />
                    </div>
                ) : useRichEditor ? (
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        editable={false}
                        className="flex-1"
                    />
                ) : (
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap flex-1 overflow-y-auto p-1">
                        {content}
                    </div>
                )
            )}
        </div>
    );
};
