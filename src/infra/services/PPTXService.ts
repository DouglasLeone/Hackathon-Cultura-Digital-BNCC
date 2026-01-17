
import PptxGenJS from "pptxgenjs";

export class PPTXService {
    static async generateLessonPlanPPTX(title: string, content: string) {
        const pptx = new PptxGenJS();

        // 1. Title Slide
        let slide = pptx.addSlide();
        slide.addText(title, { x: 1, y: 1.5, w: '80%', h: 1, fontSize: 36, color: '363636', align: 'center' });
        slide.addText("Plano de Aula Gerado com IA", { x: 1, y: 3, w: '80%', fontSize: 18, color: '808080', align: 'center' });

        // 2. Content Slides
        // Basic parser to split content by headers or paragraphs
        // For simplicity, we'll just put the content in a slide with scrolling-like behavior if too long
        // Ideally we parses markdown

        slide = pptx.addSlide();
        slide.addText("Conteúdo do Plano", { x: 0.5, y: 0.5, fontSize: 24, color: '363636' });

        // Strip markdown roughly
        const cleanContent = content.replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '');

        slide.addText(cleanContent, {
            x: 0.5, y: 1.2, w: '90%', h: '80%',
            fontSize: 14, color: '000000',
            valign: 'top',
            linebreak: true
        });

        // Save
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
        await pptx.writeFile({ fileName });
    }
}
