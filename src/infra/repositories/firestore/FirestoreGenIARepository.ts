import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HistoricoGeracao } from '../../../model/entities';
import { IGenIARepository } from '../../../model/repositories/IGenIARepository';

export class FirestoreGenIARepository implements IGenIARepository {
    private historicoCollection = 'historico_geracao';

    async getStats(): Promise<{
        disciplinas: number;
        unidades: number;
        planos: number;
        atividades: number;
    }> {
        const [
            disciplinasSnap,
            unidadesSnap,
            planosSnap,
            atividadesSnap
        ] = await Promise.all([
            getCountFromServer(collection(db, 'disciplinas')),
            getCountFromServer(collection(db, 'unidades')),
            getCountFromServer(collection(db, 'planos_aula')),
            getCountFromServer(collection(db, 'atividades_avaliativas'))
        ]);

        return {
            disciplinas: disciplinasSnap.data().count,
            unidades: unidadesSnap.data().count,
            planos: planosSnap.data().count,
            atividades: atividadesSnap.data().count
        };
    }

    async getHistorico(): Promise<HistoricoGeracao[]> {
        const q = query(collection(db, this.historicoCollection), orderBy('created_at', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as HistoricoGeracao));
    }

    async addHistorico(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>): Promise<HistoricoGeracao> {
        const now = new Date().toISOString();
        const data = {
            ...historico,
            created_at: now
        };

        const docRef = await addDoc(collection(db, this.historicoCollection), data);

        return {
            id: docRef.id,
            ...data
        };
    }

    async deleteHistorico(id: string): Promise<void> {
        const docRef = doc(db, this.historicoCollection, id);
        await deleteDoc(docRef);
    }
}
