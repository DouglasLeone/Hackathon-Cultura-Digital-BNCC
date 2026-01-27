import React, { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { SlideCard } from './SlideCard';
import { SlideContent } from '@/model/entities';

interface SlidesViewerProps {
    slides: SlideContent[];
    title?: string;
}

export const SlidesViewer: React.FC<SlidesViewerProps> = ({ slides, title }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    const handleDownloadPPTX = () => {
        const pres = new pptxgen();
        pres.title = title || "Apresentação Gerada por IA";
        pres.layout = 'LAYOUT_16x9';

        pres.defineSlideMaster({
            title: "EDUCATIONAL_THEME",
            background: { color: "FFFFFF" },
            objects: [
                { rect: { x: 0, y: 0, w: "100%", h: 0.1, fill: { color: "3b82f6" } } }, // Blue top bar
                { text: { text: "Aula Criativa AI", options: { x: 0.5, y: 5.4, w: "100%", fontSize: 10, color: "94a3b8" } } }
            ]
        });

        slides.forEach(slide => {
            const slidePage = pres.addSlide({ masterName: "EDUCATIONAL_THEME" });

            slidePage.addText(slide.titulo, {
                x: 0.5, y: 0.5, w: '90%', h: 0.8,
                fontSize: 32, bold: true, color: '1e293b', align: 'left', fontFace: 'Arial'
            });

            slidePage.addText(slide.conteudo.map(c => ({ text: c, options: { bullet: { code: '2022' }, breakLine: true } })), {
                x: 0.5, y: 1.5, w: '55%', h: 3.5,
                fontSize: 18, color: '334155', align: 'left', fontFace: 'Arial', lineSpacing: 32
            });

            // Visual Placeholder in PPTX
            slidePage.addText(`Sugestão Visual:\n"${slide.imagem_sugerida || 'Imagem ilustrativa'}"`, {
                x: 6.2, y: 1.5, w: 3.5, h: 3.5,
                fontSize: 12, color: '64748b', align: 'center', valign: 'middle',
                shape: pres.ShapeType.rect, fill: { color: 'f1f5f9' }, line: { color: 'cbd5e1', dashType: 'dash' }
            });

            if (slide.roteiro_professor || slide.anotacoes) {
                slidePage.addNotes(slide.roteiro_professor || slide.anotacoes);
            }
        });

        pres.writeFile({ fileName: `${title || 'Apresentacao'}.pptx` });
    };

    if (!slides || slides.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Nenhum slide para exibir.</div>;
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center px-2">
                <div className="text-sm font-medium text-muted-foreground">
                    Modo de Apresentação
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadPPTX} className="gap-2">
                    <Download className="w-4 h-4" />
                    Baixar Slides (.pptx)
                </Button>
            </div>

            <div className="relative group">
                {/* Slide Card Component */}
                <SlideCard
                    slide={slides[currentSlide]}
                    index={currentSlide}
                    total={slides.length}
                />

                {/* Navigation Overlays (Hover) */}
                <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        className="h-full w-full rounded-r-xl rounded-l-none hover:bg-black/5 text-gray-400 hover:text-gray-900"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>
                <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        className="h-full w-full rounded-l-xl rounded-r-none hover:bg-black/5 text-gray-400 hover:text-gray-900"
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 rounded-full h-2 ${idx === currentSlide ? 'bg-primary w-8' : 'bg-gray-200 w-2 hover:bg-gray-300'
                            }`}
                        aria-label={`Ir para slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
