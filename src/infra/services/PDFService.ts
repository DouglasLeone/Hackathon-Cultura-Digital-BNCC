import { jsPDF } from 'jspdf';
import { PlanoAula, AtividadeAvaliativa } from '@/model/entities';

interface TOCItem {
    title: string;
    page: number;
    y: number;
}

export class PDFService {
    private static readonly MARGIN_X = 24;
    private static readonly MARGIN_Y = 24;
    private static readonly LINE_HEIGHT = 6.5;
    private static readonly PAGE_HEIGHT = 297;
    private static readonly PAGE_WIDTH = 210;
    private static readonly CONTENT_WIDTH = 162; // 210 - 24*2

    private static readonly COLORS = {
        TEXT: '#37352f',
        GRAY: '#787774',
        BG_GRAY: '#f1f1ef',
        BORDER_GRAY: '#e0e0e0',
        ACCENT: '#2e86de'
    };

    private static currentY: number = 0;
    private static currentX: number = 0;
    private static tocItems: TOCItem[] = [];

    static generateLessonPlanPDF(plano: PlanoAula, disciplina: string = 'Disciplina', tema: string = 'Tema', schoolName: string = 'Escola Exemplar'): void {
        const doc = new jsPDF();
        this.resetState();
        this.setupDocument(doc);

        // 1. Title Page & Properties
        this.renderNotionHeader(doc, plano.titulo, schoolName);
        this.renderProperties(doc, [
            { label: 'Disciplina', value: disciplina },
            { label: 'Tema', value: tema },
            { label: 'Data', value: new Date().toLocaleDateString('pt-BR') }
        ]);

        this.newLine(doc, 10);

        // 2. Reserve TOC Page (if content is long enough reasonably, but let's always add it for structure)
        const tocPageNumber = doc.getNumberOfPages() + 1;
        doc.addPage(); // Page 2
        this.currentY = this.MARGIN_Y;
        // We will render TOC content here LATER

        // 3. Render Content (Start on Page 3 to be clean)
        doc.addPage(); // Page 3
        this.currentY = this.MARGIN_Y;

        this.renderSmartContent(doc, plano.conteudo || '');

        // 4. Go back and Render TOC
        this.renderTOC(doc, tocPageNumber);

        // 5. Global Polish (Footers)
        this.addFooter(doc, schoolName);

        doc.save(`${this.sanitizeFilename(plano.titulo)}.pdf`);
    }

    static generateActivityPDF(atividade: AtividadeAvaliativa, disciplina: string = 'Disciplina', tema: string = 'Tema', schoolName: string = 'Escola Exemplar'): void {
        const doc = new jsPDF();
        this.resetState();
        this.setupDocument(doc);

        this.renderNotionHeader(doc, atividade.titulo, schoolName);
        this.renderProperties(doc, [
            { label: 'Disciplina', value: disciplina },
            { label: 'Tipo', value: atividade.tipo }
        ]);

        this.newLine(doc, 14);

        if (atividade.conteudo) {
            this.renderSmartContent(doc, atividade.conteudo);
        } else {
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
                    this.newLine(doc, 4);
                    doc.setDrawColor(this.COLORS.BORDER_GRAY);
                    doc.line(this.currentX, this.currentY, this.currentX + this.CONTENT_WIDTH, this.currentY);
                    this.newLine(doc, 6);
                    doc.line(this.currentX, this.currentY, this.currentX + this.CONTENT_WIDTH, this.currentY);
                    this.newLine(doc, 2);
                }
            });
        }
        this.addFooter(doc, schoolName);
        doc.save(`${this.sanitizeFilename(atividade.titulo)}.pdf`);
    }

    private static resetState(): void {
        this.tocItems = [];
        this.currentY = this.MARGIN_Y;
    }

    private static setupDocument(doc: jsPDF): void {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(this.COLORS.TEXT);
    }

    private static renderTOC(doc: jsPDF, pageNum: number): void {
        doc.setPage(pageNum);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.TEXT);
        doc.text("Sumário", this.MARGIN_X, this.MARGIN_Y);

        let y = this.MARGIN_Y + 15;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        if (this.tocItems.length === 0) {
            doc.setTextColor(this.COLORS.GRAY);
            doc.text("Nenhum item indexado.", this.MARGIN_X, y);
            return;
        }

        this.tocItems.forEach(item => {
            const pageStr = `${item.page}`;

            // Draw Dots
            const titleWidth = doc.getTextWidth(item.title);
            const numWidth = doc.getTextWidth(pageStr);
            const dotsWidth = this.CONTENT_WIDTH - titleWidth - numWidth - 5;

            doc.setTextColor(this.COLORS.ACCENT); // Link color
            doc.text(item.title, this.MARGIN_X, y);

            doc.setTextColor(this.COLORS.BORDER_GRAY);
            if (dotsWidth > 0) {
                doc.text(".".repeat(Math.floor(dotsWidth / 2)), this.MARGIN_X + titleWidth + 2, y);
            }

            doc.setTextColor(this.COLORS.TEXT);
            doc.text(pageStr, this.MARGIN_X + this.CONTENT_WIDTH - numWidth, y);

            // Link is clickable in PDF
            doc.link(this.MARGIN_X, y - 5, this.CONTENT_WIDTH, 7, { pageNumber: item.page, top: item.y });

            y += 8;
        });
    }

    private static renderNotionHeader(doc: jsPDF, title: string, subtitle: string = ''): void {
        // Branding Hint (Top Right)
        if (subtitle) {
            doc.setFontSize(9);
            doc.setTextColor(this.COLORS.GRAY);
            doc.text(subtitle.toUpperCase(), this.PAGE_WIDTH - this.MARGIN_X, this.MARGIN_Y, { align: 'right' });
        }

        // Notion Page Icon Style
        doc.setFillColor(this.COLORS.BG_GRAY);
        doc.roundedRect(this.MARGIN_X, this.currentY, 20, 20, 2, 2, 'F');
        doc.setFontSize(14);
        doc.setTextColor(this.COLORS.GRAY);
        doc.text("DOC", this.MARGIN_X + 2, this.currentY + 14);

        this.newLine(doc, 24);

        // Title
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(this.COLORS.TEXT);

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

        const lines = content.split('\n');
        let tableRows: string[][] = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) { this.newLine(doc, 4); continue; }

            // Table Detection
            if (line.startsWith('|')) {
                if (/^\|[-:\s|]+\|$/.test(line)) {
                    continue; // Skip separator line
                }
                const row = line.split('|').map(cell => cell.trim()).filter((val, idx, arr) => idx > 0 && idx < arr.length - 1);
                if (row.length === 0 && line.length > 2) tableRows.push(line.substring(1, line.length - 1).split('|').map(c => c.trim()));
                else tableRows.push(row);

                if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
                    this.renderTable(doc, tableRows);
                    tableRows = [];
                }
                continue;
            }

            // Headers & TOC Tracking
            if (line.startsWith('# ')) {
                this.newLine(doc, 8);
                const text = line.substring(2);
                this.renderHeader(doc, text, 20);
                this.addToTOC(doc, text);
                continue;
            }
            if (line.startsWith('## ')) {
                this.newLine(doc, 6);
                const text = line.substring(3);
                this.renderHeader(doc, text, 16);
                this.addToTOC(doc, text);
                continue;
            }
            if (line.startsWith('### ')) {
                this.newLine(doc, 4);
                this.renderHeader(doc, line.substring(4), 14);
                continue;
            }

            // Blockquotes
            if (line.startsWith('> ')) {
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

            // Paragraphs
            if (line.startsWith('**') && line.endsWith('**')) {
                this.addRichParagraph(doc, line.replace(/\*\*/g, ''), 11, 'bold');
            } else {
                this.addRichParagraph(doc, line, 11, 'normal');
            }
            this.newLine(doc, 4);
        }
    }

    private static addToTOC(doc: jsPDF, title: string): void {
        this.tocItems.push({
            title: title,
            page: doc.getCurrentPageInfo().pageNumber,
            y: this.currentY
        });
    }

    private static renderTable(doc: jsPDF, rows: string[][]): void {
        if (rows.length === 0) return;
        const colCount = rows[0].length;
        const colWidth = this.CONTENT_WIDTH / colCount;
        const padding = 2;

        rows.forEach((row, rowIndex) => {
            let maxCellHeight = 0;
            const processedCells = row.map(cell => {
                const cellLines = doc.splitTextToSize(cell, colWidth - (padding * 2));
                const h = (cellLines.length * 6) + (padding * 2);
                if (h > maxCellHeight) maxCellHeight = h;
                return cellLines;
            });

            this.currentY = this.checkPageBreak(doc, this.currentY, maxCellHeight);

            if (rowIndex === 0) {
                doc.setFillColor(this.COLORS.BG_GRAY);
                doc.rect(this.MARGIN_X, this.currentY, this.CONTENT_WIDTH, maxCellHeight, 'F');
                doc.setFont('helvetica', 'bold');
            } else {
                doc.setFont('helvetica', 'normal');
            }

            let currentX = this.MARGIN_X;
            doc.setDrawColor(this.COLORS.BORDER_GRAY);
            doc.setTextColor(this.COLORS.TEXT);
            doc.setFontSize(9);

            row.forEach((_, colIndex) => {
                doc.rect(currentX, this.currentY, colWidth, maxCellHeight);
                doc.text(processedCells[colIndex], currentX + padding, this.currentY + padding + 4);
                currentX += colWidth;
            });

            this.currentY += maxCellHeight;
        });

        this.newLine(doc, 4);
        doc.setFontSize(11);
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
        const lineHeight = 7;
        const boxHeight = (lines.length * lineHeight) + (padding * 2);

        this.currentY = this.checkPageBreak(doc, this.currentY, boxHeight);

        doc.setFillColor(this.COLORS.BG_GRAY);
        doc.setDrawColor(this.COLORS.BG_GRAY);
        doc.roundedRect(this.MARGIN_X, this.currentY, this.CONTENT_WIDTH, boxHeight, 2, 2, 'F');

        // Icon replacement
        doc.setFillColor(255, 255, 255);
        doc.circle(this.MARGIN_X + padding + 3, this.currentY + padding + 4, 3, 'F');
        doc.setTextColor(this.COLORS.GRAY);
        doc.setFontSize(8);
        doc.text("i", this.MARGIN_X + padding + 2.2, this.currentY + padding + 5);

        // Text
        doc.setFontSize(10);
        doc.setTextColor(this.COLORS.TEXT);
        doc.text(lines, this.MARGIN_X + padding + iconWidth, this.currentY + padding + 5, { lineHeightFactor: 1.5 });

        this.currentY += boxHeight;
        this.newLine(doc, 4);
    }

    private static renderBullet(doc: jsPDF, text: string, indent: number = 5, bullet: string = '• '): void {
        const bulletWidth = doc.getTextWidth(bullet);
        const textWidth = this.CONTENT_WIDTH - indent - bulletWidth;
        const lines = doc.splitTextToSize(text, textWidth);
        const lineHeight = 7;

        this.currentY = this.checkPageBreak(doc, this.currentY, lines.length * lineHeight);

        doc.text(bullet, this.MARGIN_X + indent, this.currentY);
        doc.text(lines, this.MARGIN_X + indent + bulletWidth, this.currentY, { lineHeightFactor: 1.5 });

        this.currentY += (lines.length * lineHeight) + 2;
    }

    private static addRichParagraph(doc: jsPDF, text: string, size: number, style: string): void {
        doc.setFontSize(size);

        const cleanText = text.replace(/\*\*/g, '');
        const lines = doc.splitTextToSize(cleanText, this.CONTENT_WIDTH);
        const lineHeight = 7;

        this.currentY = this.checkPageBreak(doc, this.currentY, lines.length * lineHeight);
        doc.text(lines, this.MARGIN_X, this.currentY, { lineHeightFactor: 1.5 });
        this.currentY += (lines.length * lineHeight);
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

    private static addFooter(doc: jsPDF, schoolName: string = ''): void {
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(this.COLORS.GRAY);

            const text = `Aula Criativa AI${schoolName ? ` | ${schoolName}` : ''} - Página ${i} de ${total}`;
            doc.text(text, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 10, { align: 'center' });
        }
    }

    private static sanitizeFilename(n: string): string { return n.replace(/[^a-z0-9]/gi, '_').toLowerCase(); }
}
