import { jsPDF } from 'jspdf';
import { PlanoAula, AtividadeAvaliativa } from '@/model/entities';

export class PDFService {
    private static readonly MARGIN = 20;
    private static readonly LINE_HEIGHT = 7;
    private static readonly PAGE_HEIGHT = 297;
    private static readonly PAGE_WIDTH = 210;
    private static currentY: number = 0;
    private static currentX: number = 20;

    static generateLessonPlanPDF(plano: PlanoAula, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        this.resetState();
        this.renderProfessionalHeader(doc, plano.titulo, `${disciplina} - ${tema}`);
        this.renderSmartContent(doc, plano.conteudo || '');
        this.addFooter(doc);
        doc.save(`${this.sanitizeFilename(plano.titulo)}.pdf`);
    }

    static generateActivityPDF(atividade: AtividadeAvaliativa, disciplina: string = 'Disciplina', tema: string = 'Tema'): void {
        const doc = new jsPDF();
        this.resetState();
        this.renderProfessionalHeader(doc, atividade.titulo, `${disciplina} - ${tema} | Tipo: ${atividade.tipo}`);
        if (atividade.conteudo) {
            this.renderSmartContent(doc, atividade.conteudo);
        } else {
            this.renderSection(doc, 'Instruções', atividade.instrucoes);
            this.newLine(doc, 5);
            this.renderHeader(doc, 'Questões', 16);
            atividade.questoes.forEach((q, index) => {
                this.newLine(doc, 5);
                this.renderHeader(doc, `Questão ${index + 1} (${q.pontuacao} pts)`, 12);
                this.renderSmartContent(doc, q.enunciado);
                if (q.tipo === 'multipla_escolha' && q.alternativas) {
                    q.alternativas.forEach((alt, i) => {
                        this.renderBullet(doc, `${String.fromCharCode(65 + i)}) ${alt}`, 10, '');
                    });
                } else if (q.tipo === 'verdadeiro_falso') {
                    this.renderBullet(doc, "( ) Verdadeiro  ( ) Falso", 10, '');
                } else this.newLine(doc, 15);
            });
        }
        this.addFooter(doc);
        doc.save(`${this.sanitizeFilename(atividade.titulo)}.pdf`);
    }

    private static resetState(): void {
        this.currentY = this.MARGIN;
        this.currentX = this.MARGIN;
    }

    private static renderProfessionalHeader(doc: jsPDF, title: string, subtitle: string): void {
        this.addRichParagraph(doc, title.toUpperCase(), 20, 'bold');
        this.newLine(doc, 1);
        doc.setTextColor(100);
        this.addRichParagraph(doc, subtitle, 10, 'italic');
        doc.setTextColor(0);
        this.newLine(doc, 5);
        doc.setDrawColor(220);
        doc.line(this.MARGIN, this.currentY, this.PAGE_WIDTH - this.MARGIN, this.currentY);
        this.newLine(doc, 10);
    }

    private static renderSmartContent(doc: jsPDF, content: string): void {
        if (!content) return;
        if (content.trim().startsWith('<')) this.renderHTML(doc, content);
        else this.renderMarkdown(doc, content);
    }

    private static renderMarkdown(doc: jsPDF, md: string): void {
        // Normalize: ensure headers and lists are on new lines
        const normalized = md
            .replace(/([^\n])(#{1,4}\s)/g, '$1\n$2')
            .replace(/([^\n])(^\s*[-*•]\s)/gm, '$1\n$2')
            .replace(/([^\n])(^\s*\d+\.\s)/gm, '$1\n$2');

        const lines = normalized.split('\n');
        let tableRows: string[][] = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) { this.newLine(doc, 4); return; }

            if (trimmed.startsWith('|')) {
                const cells = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => (i > 0 && i < arr.length - 1) || c !== '');
                if (!cells.every(c => /^[:\s-]+$/.test(c))) tableRows.push(cells);
                if (!lines[index + 1]?.trim().startsWith('|')) {
                    this.renderTable(doc, tableRows);
                    tableRows = [];
                }
                return;
            }

            const headerMatch = trimmed.match(/^(#{1,4})\s+(.*)/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const sizes = [0, 18, 16, 14, 12];
                this.newLine(doc, 6);
                this.renderHeader(doc, headerMatch[2], sizes[level] || 12);
                this.newLine(doc, 3);
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
                this.renderBullet(doc, trimmed.substring(2));
            } else if (/^\d+\.\s/.test(trimmed)) {
                const parts = trimmed.split(/(\d+\.\s+)/);
                this.renderBullet(doc, parts[2], 5, parts[1]);
            } else {
                this.addRichParagraph(doc, trimmed, 11, 'normal');
                this.newLine(doc, 3);
            }
        });
    }

    private static renderHeader(doc: jsPDF, text: string, size: number): void {
        this.currentX = this.MARGIN;
        this.renderRichInline(doc, text, size, 'bold');
        this.newLine(doc, 2);
    }

    private static renderBullet(doc: jsPDF, text: string, indent: number = 5, bullet: string = '• '): void {
        this.currentX = this.MARGIN + indent;
        if (bullet) this.renderRichInline(doc, bullet, 11, 'bold');
        this.renderRichInline(doc, text, 11, 'normal');
        this.newLine(doc, 5);
    }

    private static renderSection(doc: jsPDF, title: string, content: string): void {
        this.renderHeader(doc, title, 14);
        this.renderMarkdown(doc, content);
    }

    private static renderTable(doc: jsPDF, rows: string[][]): void {
        if (rows.length === 0) return;
        const colWidth = (this.PAGE_WIDTH - (this.MARGIN * 2)) / rows[0].length;
        rows.forEach((row, rowIndex) => {
            let h = 0;
            row.forEach(c => h = Math.max(h, doc.splitTextToSize(c, colWidth - 4).length * 5 + 4));
            this.currentY = this.checkPageBreak(doc, this.currentY, h);
            row.forEach((c, i) => {
                const x = this.MARGIN + (i * colWidth);
                doc.rect(x, this.currentY, colWidth, h);
                if (rowIndex === 0) { doc.setFillColor(245, 245, 245); doc.rect(x, this.currentY, colWidth, h, 'F'); doc.setFont('helvetica', 'bold'); }
                else doc.setFont('helvetica', 'normal');
                doc.text(doc.splitTextToSize(c, colWidth - 4), x + 2, this.currentY + 5);
            });
            this.currentY += h;
        });
        this.newLine(doc, 5);
    }

    private static addRichParagraph(doc: jsPDF, text: string, size: number, style: string): void {
        this.currentX = this.MARGIN;
        this.renderRichInline(doc, text, size, style);
    }

    private static renderRichInline(doc: jsPDF, text: string, size: number, style: string): void {
        doc.setFontSize(size);
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_)/g);
        parts.forEach(part => {
            if (!part) return;
            let s = style;
            let c = part;
            if (part.startsWith('**') || part.startsWith('__')) { s = 'bold'; c = part.slice(2, -2); }
            else if (part.startsWith('*') || (part.startsWith('_') && !part.includes(' '))) { s = 'italic'; c = part.slice(1, -1); }
            doc.setFont('helvetica', s);
            const words = c.split(/(\s+)/);
            words.forEach(w => {
                const ww = doc.getTextWidth(w);
                if (this.currentX + ww > this.PAGE_WIDTH - this.MARGIN) { this.newLine(doc); }
                doc.text(w, this.currentX, this.currentY);
                this.currentX += ww;
            });
        });
    }

    private static renderHTML(doc: jsPDF, html: string): void {
        const body = (new DOMParser()).parseFromString(html, 'text/html').body;
        this.processHTMLNode(doc, body);
    }

    private static processHTMLNode(doc: jsPDF, node: Node, indent: number = 0): void {
        if (node.nodeType === 3) {
            if (node.textContent) this.renderRichInline(doc, node.textContent, 11, doc.getFont().fontStyle);
        } else if (node.nodeType === 1) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            const oldS = doc.getFont().fontStyle;
            switch (tag) {
                case 'h1': case 'h2': case 'h3': this.newLine(doc, 5); this.renderHeader(doc, el.textContent || '', 18 - (parseInt(tag[1]) - 1) * 2); break;
                case 'p': this.newLine(doc, 4); Array.from(el.childNodes).forEach(c => this.processHTMLNode(doc, c)); this.newLine(doc, 2); break;
                case 'strong': case 'b': doc.setFont('helvetica', 'bold'); Array.from(el.childNodes).forEach(c => this.processHTMLNode(doc, c)); doc.setFont('helvetica', oldS); break;
                case 'em': case 'i': doc.setFont('helvetica', 'italic'); Array.from(el.childNodes).forEach(c => this.processHTMLNode(doc, c)); doc.setFont('helvetica', oldS); break;
                case 'ul': case 'ol': this.newLine(doc, 2); Array.from(el.children).forEach((li, i) => this.renderBullet(doc, li.textContent || '', indent + 5, tag === 'ul' ? '• ' : `${i + 1}. `)); break;
                case 'br': this.newLine(doc); break;
                default: Array.from(node.childNodes).forEach(c => this.processHTMLNode(doc, c, indent));
            }
        }
    }

    private static newLine(doc: jsPDF, s: number = this.LINE_HEIGHT): void {
        this.currentY += s;
        this.currentX = this.MARGIN;
        if (this.currentY >= this.PAGE_HEIGHT - this.MARGIN) { doc.addPage(); this.currentY = this.MARGIN + this.LINE_HEIGHT; }
    }

    private static checkPageBreak(doc: jsPDF, y: number, h: number): number {
        if (y + h >= this.PAGE_HEIGHT - this.MARGIN) { doc.addPage(); return this.MARGIN + this.LINE_HEIGHT; }
        return y;
    }

    private static addFooter(doc: jsPDF): void {
        const total = doc.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Aula Criativa AI - Página ${i} de ${total}`, this.PAGE_WIDTH / 2, this.PAGE_HEIGHT - 10, { align: 'center' });
        }
    }

    private static sanitizeFilename(n: string): string { return n.replace(/[^a-z0-9]/gi, '_').toLowerCase(); }
}
