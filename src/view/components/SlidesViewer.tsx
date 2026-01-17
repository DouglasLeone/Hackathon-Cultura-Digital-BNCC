
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface Slide {
    titulo: string;
    conteudo: string[];
    imagem?: string; // Placeholder for future
}

// Mock slides if none provided (for beta)
const MOCK_SLIDES: Slide[] = [
    { titulo: "Introdução", conteudo: ["Bem-vindo ao curso", "Objetivos da aula"] },
    { titulo: "Conceitos Básicos", conteudo: ["Definição de Algoritmo", "Exemplos do dia a dia"] },
    { titulo: "Prática", conteudo: ["Exercício 1", "Exercício 2"] },
    { titulo: "Conclusão", conteudo: ["Resumo", "Próximos passos"] },
];

interface SlidesViewerProps {
    slides?: Slide[];
    title?: string;
}

export const SlidesViewer: React.FC<SlidesViewerProps> = ({ slides = MOCK_SLIDES, title }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title || "Apresentação"}</h3>
                <span className="text-sm text-muted-foreground">{currentSlide + 1} / {slides.length}</span>
            </div>

            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl overflow-hidden flex items-center justify-center p-12 text-white">
                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-bold mb-4">{slides[currentSlide].titulo}</h2>
                    <ul className="space-y-3 text-xl text-slate-300">
                        {slides[currentSlide].conteudo.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="text-white hover:bg-white/20" onClick={prevSlide} disabled={currentSlide === 0}>
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/20" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
            </div>

            <div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${idx === currentSlide ? 'bg-primary' : 'bg-slate-300'}`}
                    />
                ))}
            </div>
        </div>
    );
};
