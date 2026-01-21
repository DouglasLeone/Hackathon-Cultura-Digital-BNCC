import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Unidade, PlanoAula, AtividadeAvaliativa } from '../../../model/entities';
import { IUnidadeRepository } from '../../../model/repositories/IUnidadeRepository';

export class FirestoreUnidadeRepository implements IUnidadeRepository {
    private collectionName = 'unidades';
    private planosCollection = 'planos_aula';
    private atividadesCollection = 'atividades_avaliativas';

    // Unidade Methods
    async getAll(): Promise<Unidade[]> {
        const q = query(collection(db, this.collectionName), orderBy('tema'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Unidade));
    }

    async getByDisciplinaId(disciplinaId: string): Promise<Unidade[]> {
        const q = query(
            collection(db, this.collectionName),
            where('disciplina_id', '==', disciplinaId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Unidade));
    }

    async getById(id: string): Promise<Unidade | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const unidadeData = {
                id: docSnap.id,
                ...docSnap.data()
            } as Unidade;

            // Fetch related materials
            const [plano, atividade] = await Promise.all([
                this.getPlanoAula(unidadeData.id),
                this.getAtividade(unidadeData.id)
            ]);

            return {
                ...unidadeData,
                plano_aula: plano || undefined,
                atividade_avaliativa: atividade || undefined
            };
        }
        return null;
    }

    async create(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>): Promise<Unidade> {
        const now = new Date().toISOString();
        const data = {
            ...unidade,
            created_at: now,
            updated_at: now
        };

        const docRef = await addDoc(collection(db, this.collectionName), data);

        return {
            id: docRef.id,
            ...data
        };
    }

    async update(id: string, unidade: Partial<Unidade>): Promise<Unidade> {
        const docRef = doc(db, this.collectionName, id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...unidade,
            updated_at: now
        };

        const validData = Object.fromEntries(
            Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
        );

        await updateDoc(docRef, validData);

        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists()) throw new Error('Unidade not found after update');

        return {
            id: updatedSnap.id,
            ...updatedSnap.data()
        } as Unidade;
    }

    async delete(id: string): Promise<void> {
        // Warning: This doesn't cascade delete linked materials yet. 
        // In a production app, we should delete linked planos and atividades.
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    // PlanoAula Methods
    async getPlanoAula(unidadeId: string): Promise<PlanoAula | null> {
        const q = query(
            collection(db, this.planosCollection),
            where('unidade_id', '==', unidadeId),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as PlanoAula;
            if (data.arquivado) return null;
            return {
                id: doc.id,
                ...data
            };
        }
        return null;
    }

    async createPlanoAula(plano: Omit<PlanoAula, 'id' | 'created_at' | 'updated_at'>): Promise<PlanoAula> {
        const now = new Date().toISOString();
        const data = {
            ...plano,
            created_at: now,
            updated_at: now
        };

        const docRef = await addDoc(collection(db, this.planosCollection), data);

        return {
            id: docRef.id,
            ...data
        };
    }

    async updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
        const docRef = doc(db, this.planosCollection, id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...plano,
            updated_at: now
        };

        const validData = Object.fromEntries(
            Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
        );

        await updateDoc(docRef, validData);

        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists()) throw new Error('PlanoAula not found after update');

        return {
            id: updatedSnap.id,
            ...updatedSnap.data()
        } as PlanoAula;
    }

    // AtividadeAvaliativa Methods
    async getAtividade(unidadeId: string): Promise<AtividadeAvaliativa | null> {
        const q = query(
            collection(db, this.atividadesCollection),
            where('unidade_id', '==', unidadeId),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as AtividadeAvaliativa;
            if (data.arquivado) return null;
            return {
                id: doc.id,
                ...data
            };
        }
        return null;
    }

    async createAtividade(atividade: Omit<AtividadeAvaliativa, 'id' | 'created_at' | 'updated_at'>): Promise<AtividadeAvaliativa> {
        const now = new Date().toISOString();
        const data = {
            ...atividade,
            created_at: now,
            updated_at: now
        };

        const docRef = await addDoc(collection(db, this.atividadesCollection), data);

        return {
            id: docRef.id,
            ...data
        };
    }

    async updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
        const docRef = doc(db, this.atividadesCollection, id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...atividade,
            updated_at: now
        };

        const validData = Object.fromEntries(
            Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
        );

        await updateDoc(docRef, validData);

        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists()) throw new Error('AtividadeAvaliativa not found after update');

        return {
            id: updatedSnap.id,
            ...updatedSnap.data()
        } as AtividadeAvaliativa;
    }
}
