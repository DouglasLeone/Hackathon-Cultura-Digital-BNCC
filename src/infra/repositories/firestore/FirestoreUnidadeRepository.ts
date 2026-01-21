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
import { Unidade, PlanoAula, AtividadeAvaliativa, MaterialSlides } from '../../../model/entities';
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
            const unidade = { id: docSnap.id, ...docSnap.data() } as Unidade;

            // Join discipline
            if (unidade.disciplina_id) {
                const disciplinaRef = doc(db, 'disciplinas', unidade.disciplina_id);
                const disciplinaSnap = await getDoc(disciplinaRef);
                if (disciplinaSnap.exists()) {
                    unidade.disciplina = { id: disciplinaSnap.id, ...disciplinaSnap.data() } as import('../../../model/entities').Disciplina;
                }
            }

            // Fetch generic generated materials
            unidade.plano_aula = await this.getPlanoAula(unidade.id) || undefined;
            unidade.atividade_avaliativa = await this.getAtividade(unidade.id) || undefined;
            unidade.material_slides = await this.getMaterialSlides(unidade.id) || undefined;

            return unidade;
        } else {
            return null;
        }
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

    async updatePlanoAula(id: string, plano: Partial<PlanoAula>): Promise<void> {
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

    async updateAtividade(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<void> {
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
    }

    // Slides Methods
    async createMaterialSlides(data: Omit<MaterialSlides, 'id' | 'created_at' | 'updated_at'>): Promise<MaterialSlides> {
        const slidesRef = collection(db, 'material_slides');
        const now = new Date().toISOString();
        const docRef = await addDoc(slidesRef, {
            ...data,
            created_at: now,
            updated_at: now
        });
        return { id: docRef.id, ...data, created_at: now, updated_at: now };
    }

    async getMaterialSlides(unidadeId: string): Promise<MaterialSlides | null> {
        const q = query(
            collection(db, 'material_slides'),
            where('unidade_id', '==', unidadeId)
            // Removed orderBy to avoid composite index requirement during hackathon
            // orderBy('created_at', 'desc'),
            // limit(1) 
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;

        // In-memory sort to get the latest
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaterialSlides));
        docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const latest = docs[0];
        if (latest.arquivado) return null;

        return latest;
    }

    async updateMaterialSlides(id: string, data: Partial<MaterialSlides>): Promise<void> {
        const docRef = doc(db, 'material_slides', id);
        await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
    }
}
