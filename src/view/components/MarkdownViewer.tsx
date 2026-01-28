import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className }) => {
    return (
        <div className={cn(
            'prose prose-slate max-w-none',
            'prose-headings:font-bold prose-headings:text-gray-900',
            'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6 prose-h1:border-b prose-h1:pb-2',
            'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5',
            'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4',
            'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4',
            'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
            'prose-strong:text-gray-900 prose-strong:font-semibold',
            'prose-ul:my-3 prose-ul:list-disc prose-ul:pl-6',
            'prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-6',
            'prose-li:text-gray-700 prose-li:mb-1',
            'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-700',
            'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 prose-code:font-mono',
            'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
            'prose-table:w-full prose-table:border-collapse',
            'prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:font-semibold',
            'prose-td:border prose-td:border-gray-300 prose-td:p-2',
            'prose-img:rounded-lg prose-img:shadow-md',
            'prose-hr:my-6 prose-hr:border-gray-300',
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom rendering for specific elements if needed
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 mt-6 border-b pb-2 text-gray-900" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-5 text-gray-900" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4 text-gray-800" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700" {...props} />
                    ),
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                    code: ({ node, inline, ...props }: { node?: any; inline?: boolean;[key: string]: any }) => {
                        if (inline) {
                            return <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-pink-600 font-mono" {...props} />;
                        }
                        return <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm" {...props} />;
                    },
                    a: ({ node, ...props }) => (
                        <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
