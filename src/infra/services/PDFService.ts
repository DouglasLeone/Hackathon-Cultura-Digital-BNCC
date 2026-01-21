import { jsPDF } from 'jspdf';
import { PlanoAula, AtividadeAvaliativa } from '@/model/entities';

export class PDFService {
    private static readonly MARGIN = 20;
    private static readonly LINE_HEIGHT = 7;
    private static readonly PAGE_HEIGHT = 297; // A4 height in mm
    private static readonly PAGE_WIDTH = 210; // A4 width in mm

    static generateLessonPlanPDF(plano: PlanoAula, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        let y = this.MARGIN;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        y = this.addText(doc, plano.titulo, y, 18);
        y += 5;

        // Subtitle (Disciplina / Tema)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        y = this.addText(doc, `${disciplina} - ${tema}`, y, 12);
        y += 10;
        doc.setTextColor(0);

        // Sections
        y = this.addSection(doc, 'Duração', plano.duracao, y);
        y = this.addSection(doc, 'Objetivos', plano.objetivos.join('\n'), y);
        y = this.addSection(doc, 'Conteúdo Programático', plano.conteudo_programatico, y);
        y = this.addSection(doc, 'Metodologia', plano.metodologia, y);
        y = this.addSection(doc, 'Recursos Didáticos', plano.recursos_didaticos.join('\n'), y);
        y = this.addSection(doc, 'Avaliação', plano.avaliacao, y);

        if (plano.referencias) {
            y = this.addSection(doc, 'Referências', plano.referencias, y);
        }

        // Footer
        this.addFooter(doc);

        doc.save(`${this.sanitizeFilename(plano.titulo)}.pdf`);
    }

    static generateActivityPDF(atividade: AtividadeAvaliativa, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        let y = this.MARGIN;

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        y = this.addText(doc, atividade.titulo, y, 18);
        y += 5;

        // Metadata
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        y = this.addText(doc, `${disciplina} - ${tema} | Tipo: ${atividade.tipo}`, y, 12);
        y += 10;
        doc.setTextColor(0);

        // Instructions
        y = this.addSection(doc, 'Instruções', atividade.instrucoes, y);

        // Questions
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        y = this.checkPageBreak(doc, y, 10);
        doc.text('Questões', this.MARGIN, y);
        y += 10;

        atividade.questoes.forEach((q, index) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            y = this.checkPageBreak(doc, y, 10);
            const questaoTitle = `Questão ${index + 1} (${q.pontuacao} pts)`;
            doc.text(questaoTitle, this.MARGIN, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            y = this.addText(doc, q.enunciado, y, 12);
            y += 5;

            if (q.tipo === 'multipla_escolha' && q.alternativas) {
                q.alternativas.forEach((alt, i) => {
                    const letter = String.fromCharCode(65 + i); // A, B, C...
                    y = this.addText(doc, `${letter}) ${alt}`, y, 12, 10); // Indent
                });
                y += 5;
            } else if (q.tipo === 'verdadeiro_falso') {
                y = this.addText(doc, "( ) Verdadeiro  ( ) Falso", y, 12, 10);
                y += 5;
            } else {
                // Dissertativa - Space for answer
                y += 30;
                y = this.checkPageBreak(doc, y);
            }

            y += 5; // Spacing between questions
        });

        // Footer
        this.addFooter(doc);

        doc.save(`${this.sanitizeFilename(atividade.titulo)}.pdf`);
    }

    private static addSection(doc: jsPDF, title: string, content: string, startY: number): number {
        let y = startY;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        y = this.checkPageBreak(doc, y, 10);
        doc.text(title, this.MARGIN, y);
        y += 7;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        y = this.addText(doc, content, y, 12);

        return y + 5; // Add spacing after section
    }

    // Helper to add text with wrapping and page breaks
    // Returns the new Y position
    private static addText(doc: jsPDF, text: string, y: number, fontSize: number, indent: number = 0): number {
        const maxWidth = this.PAGE_WIDTH - (this.MARGIN * 2) - indent;
        const lines = doc.splitTextToSize(text, maxWidth);

        lines.forEach((line: string) => {
            y = this.checkPageBreak(doc, y, this.LINE_HEIGHT);
            doc.text(line, this.MARGIN + indent, y);
            y += this.LINE_HEIGHT;
        });

        return y;
    }

    private static checkPageBreak(doc: jsPDF, y: number, spaceNeeded: number = 0): number {
        if (y + spaceNeeded >= this.PAGE_HEIGHT - this.MARGIN) {
            doc.addPage();
            return this.MARGIN;
        }
        return y;
    }

    private static addFooter(doc: jsPDF): void {
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(
                `Gerado por Aula Criativa AI - Página ${i} de ${totalPages}`,
                this.PAGE_WIDTH / 2,
                this.PAGE_HEIGHT - 10,
                { align: 'center' }
            );
        }
    }

    private static sanitizeFilename(name: string): string {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}
