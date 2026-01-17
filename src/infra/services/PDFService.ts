
import { jsPDF } from 'jspdf';
import { HistoricoGeracao } from '../../model/entities';

export class PDFService {
    static async generatePDF(item: HistoricoGeracao) {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(item.titulo, 20, 20);

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gerado em: ${new Date(item.created_at).toLocaleDateString('pt-BR')}`, 20, 30);
        if (item.disciplina) doc.text(`Disciplina: ${item.disciplina.nome}`, 20, 35);
        if (item.unidade) doc.text(`Unidade: ${item.unidade.tema}`, 20, 40);

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 45, 190, 45);

        // Content
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        const splitText = doc.splitTextToSize(item.descricao || "Sem conteúdo.", 170);
        doc.text(splitText, 20, 55);

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Gerado por Aula Criativa AI', 105, 290, { align: 'center' });
        }

        doc.save(`${item.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    }
}
