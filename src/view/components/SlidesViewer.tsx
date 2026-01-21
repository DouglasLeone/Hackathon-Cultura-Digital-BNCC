import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Download, Maximize2 } from 'lucide-react';
import pptxgen from 'pptxgenjs';

interface SlideContent {
    titulo: string;
    conteudo: string[];
    anotacoes?: string;
}

interface SlidesViewerProps {
    slides: SlideContent[];
    title?: string;
    onClose?: () => void;
}

export const SlidesViewer: React.FC<SlidesViewerProps> = ({ slides, title, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    const handleDownloadPPTX = () => {
        const pres = new pptxgen();
        pres.title = title || "Apresentação Gerada por IA";
        pres.layout = 'LAYOUT_16x9';

        // Define Master Slide (Dark Mode)
        pres.defineSlideMaster({
            title: "DARK_THEME",
            background: { color: "0f172a" }, // slate-900
            objects: [
                { rect: { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: "1e293b" } } }, // Top bar (slate-800)
            ]
        });

        slides.forEach(slide => {
            const slidePage = pres.addSlide({ masterName: "DARK_THEME" });

            // Title
            slidePage.addText(slide.titulo, {
                x: 0.5, y: 0.5, w: '90%', h: 1,
                fontSize: 24, bold: true, color: '38bdf8', align: 'left', fontFace: 'Arial' // 38bdf8 is sky-400 (similar to blue gradient)
            });

            // Content (Bullets)
            slidePage.addText(slide.conteudo.map(c => ({ text: c, options: { bullet: { code: '2022' } } })), {
                x: 0.5, y: 1.5, w: '90%', h: 4,
                fontSize: 18, color: 'e2e8f0', align: 'left', fontFace: 'Arial' // e2e8f0 is slate-200
            });

            // Notes
            if (slide.anotacoes) {
                slidePage.addNotes(slide.anotacoes);
            }
        });

        pres.writeFile({ fileName: `${title || 'Apresentacao'}.pptx` });
    };

    if (!slides || slides.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Nenhum slide para exibir.</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                {/* Title hidden in UI to avoid duplication if displayed in parent Dialog */}
                <div className="flex-1"></div>
                <div className="flex gap-2">
                    <span className="text-sm text-muted-foreground self-center mr-2">{currentSlide + 1} / {slides.length}</span>
                    <Button variant="outline" size="sm" onClick={handleDownloadPPTX}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar PPTX
                    </Button>
                </div>
            </div>

            <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col p-12 text-white transition-all">
                <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        {slides[currentSlide].titulo}
                    </h2>
                    <ul className="space-y-4 text-xl text-slate-200 max-w-2xl mx-auto w-full">
                        {slides[currentSlide].conteudo.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Notes Hint */}
                {slides[currentSlide].anotacoes && (
                    <div className="absolute bottom-16 left-0 right-0 text-center opacity-50 text-xs italic">
                        Possui anotações do orador
                    </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 hover:text-white"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 hover:text-white"
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
            </div>

            <div className="flex justify-center gap-2 overflow-x-auto py-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-4' : 'bg-slate-300'}`}
                        aria-label={`Ir para slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
