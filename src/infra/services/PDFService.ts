import { jsPDF } from 'jspdf';
import { PlanoAula, AtividadeAvaliativa } from '@/model/entities';

export class PDFService {
    private static readonly MARGIN_X = 24;
    private static readonly MARGIN_Y = 24;
    private static readonly LINE_HEIGHT = 6.5; // Slightly tighter line height for a clean look
    private static readonly PAGE_HEIGHT = 297;
    private static readonly PAGE_WIDTH = 210;
    private static readonly CONTENT_WIDTH = 162; // 210 - 24*2

    // Notion Colors
    private static readonly COLORS = {
        TEXT: '#37352f',
        GRAY: '#787774',
        BG_GRAY: '#f1f1ef',
        BORDER_GRAY: '#e0e0e0',
        BLUE: '#2e86de'
    };

    private static currentY: number = 0;
    private static currentX: number = 0;

    static generateLessonPlanPDF(plano: PlanoAula, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        this.setupDocument(doc);

        // Metadata as "Properties" at top
        this.renderNotionHeader(doc, plano.titulo);
        this.renderProperties(doc, [
            { label: 'Disciplina', value: disciplina },
            { label: 'Tema', value: tema },
            { label: 'Gerado em', value: new Date().toLocaleDateString('pt-BR') }
        ]);

        this.newLine(doc, 10);
        this.renderSmartContent(doc, plano.conteudo || '');
        this.addFooter(doc);
        doc.save(`${this.sanitizeFilename(plano.titulo)}.pdf`);
    }

    static generateActivityPDF(atividade: AtividadeAvaliativa, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        this.setupDocument(doc);

        this.renderNotionHeader(doc, atividade.titulo);
        this.renderProperties(doc, [
            { label: 'Disciplina', value: disciplina },
            { label: 'Tipo', value: atividade.tipo }
        ]);

        this.newLine(doc, 10);

        if (atividade.conteudo) {
            this.renderSmartContent(doc, atividade.conteudo);
        } else {
            // Default logical rendering if no generated content
            this.renderCallout(doc, atividade.instrucoes, "💡");
            this.newLine(doc, 8);

            this.renderHeader(doc, 'Questões', 16);
            atividade.questoes.forEach((q, index) => {
                this.newLine(doc, 4);
                this.renderHeader(doc, `${index + 1}. ${q.enunciado}`, 12, false);

                if (q.pontuacao) {
                    const oldColor = doc.getTextColor();
                    doc.setTextColor(this.COLORS.GRAY);
                    doc.setFontSize(10);
                    doc.text(`(${q.pontuacao} pontos)`, this.currentX + doc.getTextWidth(`${index + 1}. ${q.enunciado}`) + 2, this.currentY);
                    doc.setTextColor(oldColor);
                    this.newLine(doc, 4);
                }

                if (q.tipo === 'multipla_escolha' && q.alternativas) {
                    q.alternativas.forEach((alt, i) => {
                        this.renderBullet(doc, `${String.fromCharCode(65 + i)}) ${alt}`, 8, '');
                    });
                } else if (q.tipo === 'verdadeiro_falso') {
                    this.renderBullet(doc, "( ) Verdadeiro  ( ) Falso", 8, '');
                } else {
                    // Lines for answer
                    this.newLine(doc, 4);
                    doc.setDrawColor(this.COLORS.BORDER_GRAY);
                    doc.line(this.currentX, this.currentY, this.currentX + this.CONTENT_WIDTH, this.currentY);
                    this.newLine(doc, 6);
                    doc.line(this.currentX, this.currentY, this.currentX + this.CONTENT_WIDTH, this.currentY);
                    this.newLine(doc, 2);
                }
            });
        }
        this.addFooter(doc);
        doc.save(`${this.sanitizeFilename(atividade.titulo)}.pdf`);
    }

    private static setupDocument(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal'); // Closest to san-serif standard
        doc.setTextColor(this.COLORS.TEXT);
        this.currentY = this.MARGIN_Y;
        this.currentX = this.MARGIN_X;
    }

    private static renderNotionHeader(doc: jsPDF, title: string): void {
        // Icon (simulated)
        doc.setFontSize(40);
        doc.text("📄", this.MARGIN_X, this.currentY + 10);
        this.newLine(doc, 20);

        // Title
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');

        const titleLines = doc.splitTextToSize(title, this.CONTENT_WIDTH);
        doc.text(titleLines, this.MARGIN_X, this.currentY);
        this.currentY += (titleLines.length * 12);

        doc.setFont('helvetica', 'normal');
        this.newLine(doc, 5);

        // Separator
        doc.setDrawColor(this.COLORS.BORDER_GRAY);
        doc.line(this.MARGIN_X, this.currentY, this.PAGE_WIDTH - this.MARGIN_X, this.currentY);
        this.newLine(doc, 8);
    }

    private static renderProperties(doc: jsPDF, props: { label: string, value: string }[]): void {
        doc.setFontSize(10);

        props.forEach(p => {
            doc.setTextColor(this.COLORS.GRAY);
            doc.text(p.label, this.MARGIN_X, this.currentY);

            // Value aligned
            doc.setTextColor(this.COLORS.TEXT);
            doc.text(p.value, this.MARGIN_X + 30, this.currentY);

            this.newLine(doc, 5);
        });
    }

    private static renderSmartContent(doc: jsPDF, content: string): void {
        if (!content) return;

        // Very basic markdown parsing for Notion-like structure
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) { this.newLine(doc, 4); continue; }

            // Headers
            if (line.startsWith('# ')) {
                this.newLine(doc, 8);
                this.renderHeader(doc, line.substring(2), 20);
                continue;
            }
            if (line.startsWith('## ')) {
                this.newLine(doc, 6);
                this.renderHeader(doc, line.substring(3), 16);
                continue;
            }
            if (line.startsWith('### ')) {
                this.newLine(doc, 4);
                this.renderHeader(doc, line.substring(4), 14);
                continue;
            }

            // Blockquote / Callout
            if (line.startsWith('> ')) {
                // Collect all consecutive blockquotes
                let calloutText = line.substring(2);
                while (i + 1 < lines.length && lines[i + 1].trim().startsWith('> ')) {
                    i++;
                    calloutText += ' ' + lines[i].trim().substring(2);
                }
                this.renderCallout(doc, calloutText);
                continue;
            }

            // Lists
            if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
                this.renderBullet(doc, line.substring(2));
                continue;
            }
            if (/^\d+\.\s/.test(line)) {
                const match = line.match(/^(\d+\.\s)(.*)/);
                if (match) this.renderBullet(doc, match[2], 5, match[1]);
                continue;
            }

            // Bold Paragraph (simulating Strong) or Normal
            if (line.startsWith('**') && line.endsWith('**')) {
                this.addRichParagraph(doc, line.replace(/\*\*/g, ''), 11, 'bold');
            } else {
                this.addRichParagraph(doc, line, 11, 'normal');
            }
            this.newLine(doc, 4);
        }
    }

    private static renderHeader(doc: jsPDF, text: string, size: number, bold: boolean = true): void {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(this.COLORS.TEXT);

        const lines = doc.splitTextToSize(text, this.CONTENT_WIDTH);
        doc.text(lines, this.MARGIN_X, this.currentY);

        this.currentY += (lines.length * (size * 0.4));
        doc.setFont('helvetica', 'normal');
    }

    private static renderCallout(doc: jsPDF, text: string, icon: string = "💡"): void {
        doc.setFontSize(11);
        const padding = 6;
        const iconWidth = 10;

        const availableWidth = this.CONTENT_WIDTH - (padding * 2) - iconWidth;
        const lines = doc.splitTextToSize(text, availableWidth);
        const boxHeight = (lines.length * 5) + (padding * 2);

        // Background
        this.currentY = this.checkPageBreak(doc, this.currentY, boxHeight);

        doc.setFillColor(this.COLORS.BG_GRAY);
        doc.setDrawColor(this.COLORS.BG_GRAY); // No border usually, checking style
        doc.roundedRect(this.MARGIN_X, this.currentY, this.CONTENT_WIDTH, boxHeight, 2, 2, 'F');

        // Icon
        doc.setFontSize(14);
        doc.text(icon, this.MARGIN_X + padding, this.currentY + padding + 5);

        // Text
        doc.setFontSize(10);
        doc.setTextColor(this.COLORS.TEXT);
        doc.text(lines, this.MARGIN_X + padding + iconWidth, this.currentY + padding + 4);

        this.currentY += boxHeight;
        this.newLine(doc, 4);
    }

    private static renderBullet(doc: jsPDF, text: string, indent: number = 5, bullet: string = '• '): void {
        const bulletWidth = doc.getTextWidth(bullet);
        const textWidth = this.CONTENT_WIDTH - indent - bulletWidth;
        const lines = doc.splitTextToSize(text, textWidth);

        this.currentY = this.checkPageBreak(doc, this.currentY, lines.length * 5);

        doc.text(bullet, this.MARGIN_X + indent, this.currentY);
        doc.text(lines, this.MARGIN_X + indent + bulletWidth, this.currentY);

        this.currentY += (lines.length * 5) + 2;
    }

    private static addRichParagraph(doc: jsPDF, text: string, size: number, style: string): void {
        doc.setFontSize(size);

        // Simple bold parser for now within paragraph
        const parts = text.split(/(\*\*.*?\*\*)/g);
        let xOffset = 0;

        // We need a better multi-line approach for rich text. 
        // jsPDF simple splitTextToSize ignores font usage changes mid-stream.
        // For 'Notion-clean', we can stick to simple text for body or just render the whole thing.
        // Let's strip ** for purity if we can't render perfectly, OR, try best effort.

        // Best effort: Clean strip for width calculation, but this is hard.
        // Let's just render plain for stability in this 'Notion' version unless we implement complex cursor tracking.
        // Ideally we render lines.

        const cleanText = text.replace(/\*\*/g, '');
        const lines = doc.splitTextToSize(cleanText, this.CONTENT_WIDTH);

        this.currentY = this.checkPageBreak(doc, this.currentY, lines.length * 5);
        doc.text(lines, this.MARGIN_X, this.currentY);
        this.currentY += (lines.length * 5);
    }

    private static newLine(doc: jsPDF, s: number = this.LINE_HEIGHT): void {
        this.currentY += s;
        if (this.currentY >= this.PAGE_HEIGHT - this.MARGIN_Y) {
            doc.addPage();
            this.currentY = this.MARGIN_Y;
        }
    }

    private static checkPageBreak(doc: jsPDF, y: number, h: number): number {
        if (y + h >= this.PAGE_HEIGHT - this.MARGIN_Y) {
            doc.addPage();
            return this.MARGIN_Y;
        }
        return y;
    }

    private static addFooter(doc: jsPDF): void {
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(this.COLORS.GRAY);
            doc.text(`Página ${i} de ${total}`, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 10, { align: 'center' });
        }
    }

    private static sanitizeFilename(n: string): string { return n.replace(/[^a-z0-9]/gi, '_').toLowerCase(); }
}
