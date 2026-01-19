import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Disciplina } from '../../../model/entities';
import { IDisciplinaRepository } from '../../../model/repositories/IDisciplinaRepository';

export class FirestoreDisciplinaRepository implements IDisciplinaRepository {
    private collectionName = 'disciplinas';

    async getAll(area?: string): Promise<Disciplina[]> {
        let q;
        if (area) {
            // Ensure exact match by trimming, just in case
            const safeArea = area.trim();
            // Don't use orderBy with where clause to avoid composite index requirement
            q = query(collection(db, this.collectionName), where('area', '==', safeArea));
        } else {
            q = query(collection(db, this.collectionName), orderBy('nome'));
        }

        try {
            const querySnapshot = await getDocs(q);
            const disciplinas = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as object
            } as Disciplina));

            // Sort in-memory when filtering by area
            if (area) {
                disciplinas.sort((a, b) => a.nome.localeCompare(b.nome));
            }

            return disciplinas;
        } catch (error) {
            console.error("Firestore getAll error:", error);
            throw error;
        }
    }

    async getById(id: string): Promise<Disciplina | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Disciplina;
        }
        return null;
    }

    async create(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>): Promise<Disciplina> {
        const now = new Date().toISOString();
        const data = {
            ...disciplina,
            area: disciplina.area.trim(),
            created_at: now,
            updated_at: now
        };

        const docRef = await addDoc(collection(db, this.collectionName), data);

        return {
            id: docRef.id,
            ...data
        };
    }

    async update(id: string, disciplina: Partial<Disciplina>): Promise<Disciplina> {
        const docRef = doc(db, this.collectionName, id);
        const now = new Date().toISOString();
        const dataToUpdate = {
            ...disciplina,
            updated_at: now
        };

        // Remove undefined fields if any, but Partial allows it.
        const validData = Object.fromEntries(
            Object.entries(dataToUpdate).filter(([_, v]) => v !== undefined)
        );

        await updateDoc(docRef, validData);

        // Return full updated document
        const updatedSnap = await getDoc(docRef);
        if (!updatedSnap.exists()) throw new Error('Disciplina not found after update');

        return {
            id: updatedSnap.id,
            ...updatedSnap.data()
        } as Disciplina;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }
}
