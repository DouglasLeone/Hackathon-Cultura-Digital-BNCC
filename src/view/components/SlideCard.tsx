import React, { useState } from 'react';
import { Card, CardContent } from "@/view/components/ui/card";
import { Badge } from "@/view/components/ui/badge";
import { Button } from "@/view/components/ui/button";
import { MessageSquare, Image as ImageIcon } from 'lucide-react';
import { SlideContent } from '@/model/entities';

interface SlideCardProps {
    slide: SlideContent;
    index: number;
    total: number;
}

export const SlideCard: React.FC<SlideCardProps> = ({ slide, index, total }) => {
    const [showNotes, setShowNotes] = useState(false);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Main Slide Area - 16:9 Aspect Ratio Container */}
            <div className="relative w-full pb-[56.25%] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group">
                <div className="absolute inset-0 flex flex-col p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight max-w-[80%]">
                            {slide.titulo}
                        </h2>
                        <div className="text-sm font-medium text-gray-400">
                            {index + 1} / {total}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Text Content */}
                        <div className="flex flex-col justify-center space-y-4">
                            <ul className="space-y-3">
                                {slide.conteudo.map((point, i) => (
                                    <li key={i} className="flex items-start text-lg text-gray-700 leading-relaxed">
                                        <span className="mr-3 text-primary mt-1.5">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: Visual Placeholder */}
                        <div className="hidden md:flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                <ImageIcon className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Sugestão Visual</p>
                            <p className="text-sm text-gray-500 italic">
                                "{slide.imagem_sugerida || 'Imagem ilustrativa relacionada ao tema'}"
                            </p>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                        <span>Aula Criativa AI</span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>

            {/* Speaker Notes (Teacher's Script) */}
            <Card className={`border-emerald-100 bg-emerald-50/50 transition-all duration-300 ${showNotes ? 'opacity-100 translate-y-0' : 'opacity-80'}`}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Roteiro do Professor
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNotes(!showNotes)}
                            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 h-8 text-xs"
                        >
                            {showNotes ? 'Ocultar' : 'Expandir'}
                        </Button>
                    </div>

                    {showNotes && (
                        <p className="text-sm text-emerald-800 leading-relaxed">
                            {slide.roteiro_professor || slide.anotacoes || "Nenhuma anotação disponível."}
                        </p>
                    )}
                    {!showNotes && (
                        <p className="text-sm text-emerald-800/60 line-clamp-1 italic">
                            Clique para ver as dicas de apresentação...
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};
