import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered,
    Heading1, Heading2, Heading3, Quote, Undo, Redo,
    Link as LinkIcon, Underline as UnderlineIcon, ListTodo, Type, Eye, EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { FontSize } from './extensions/FontSize';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Comece a escrever ou digite / para ver os comandos...',
    className,
    editable = true
}) => {
    const [isPreview, setIsPreview] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextStyle,
            FontSize,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    });

    // Update editable state when prop changes
    useEffect(() => {
        if (editor && editor.isEditable !== editable) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    // Update content when it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    if (!editor) {
        return null;
    }

    const MenuButton = ({
        onClick,
        isActive,
        disabled,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <Button
            type="button"
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'h-8 w-8 p-0',
                isActive && 'bg-primary text-primary-foreground'
            )}
        >
            {children}
        </Button>
    );

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    if (!editable) {
        return (
            <div className={cn('prose max-w-none overflow-y-auto max-h-[600px] p-4', className)}>
                <EditorContent editor={editor} />
            </div>
        );
    }

    return (
        <div className={cn('border rounded-lg bg-card flex flex-col overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
                <div className="flex gap-1 border-r pr-2">
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Desfazer"
                    >
                        <Undo className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Refazer"
                    >
                        <Redo className="h-4 w-4" />
                    </MenuButton>
                </div>

                <div className="flex gap-1 border-r pr-2">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Título 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Título 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Título 3"
                    >
                        <Heading3 className="h-4 w-4" />
                    </MenuButton>
                </div>

                {/* Font Size Selector */}
                <div className="flex gap-1 border-r pr-2 items-center">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="h-8 text-sm border rounded px-2 bg-background"
                        onChange={(e) => {
                            const size = e.target.value;
                            if (size === 'normal') {
                                editor.chain().focus().unsetFontSize().run();
                            } else {
                                editor.chain().focus().setFontSize(size).run();
                            }
                        }}
                        title="Tamanho do texto"
                    >
                        <option value="normal">Normal</option>
                        <option value="14px">Pequeno</option>
                        <option value="18px">Médio</option>
                        <option value="24px">Grande</option>
                        <option value="32px">Muito Grande</option>
                    </select>
                </div>

                <div className="flex gap-1 border-r pr-2">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Negrito"
                    >
                        <Bold className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Itálico"
                    >
                        <Italic className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Sublinhado"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Tachado"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Código"
                    >
                        <Code className="h-4 w-4" />
                    </MenuButton>
                </div>

                <div className="flex gap-1 border-r pr-2">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Lista com marcadores"
                    >
                        <List className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Lista numerada"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive('taskList')}
                        title="Lista de tarefas"
                    >
                        <ListTodo className="h-4 w-4" />
                    </MenuButton>
                </div>

                <div className="flex gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Citação"
                    >
                        <Quote className="h-4 w-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        title="Adicionar link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </MenuButton>
                </div>
            </div>

            {/* Editor content or Preview */}
            <div className="flex-1 overflow-y-auto min-h-[400px] relative">
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => setIsPreview(!isPreview)}
                        className={cn("gap-2 shadow-sm", isPreview ? "bg-indigo-100 text-indigo-700" : "bg-white/80 backdrop-blur")}
                        title={isPreview ? "Voltar para edição" : "Visualizar como documento"}
                    >
                        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreview ? "Editar" : "Visualizar"}
                    </Button>
                </div>

                {isPreview ? (
                    <div
                        className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-8 bg-white min-h-full"
                        dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                    />
                ) : (
                    <EditorContent editor={editor} className="tiptap-editor" />
                )}
            </div>
        </div>
    );
};
