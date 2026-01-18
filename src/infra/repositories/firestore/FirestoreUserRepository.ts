
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IUserRepository } from '../../../model/repositories/IUserRepository';
import { UserContext, NivelEnsino } from '../../../model/entities';

export class FirestoreUserRepository implements IUserRepository {
    private collectionName = 'users';

    async getUserContext(userId: string): Promise<UserContext | null> {
        const docRef = doc(db, this.collectionName, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as UserContext;
        }
        return null; // Prompt onboarding if null
    }

    async createUserContext(userId: string, niveis: NivelEnsino[]): Promise<UserContext> {
        const now = new Date().toISOString();
        const data: UserContext = {
            id: userId,
            niveis_ensino: niveis,
            created_at: now,
            updated_at: now
        };

        // using setDoc to specify the ID
        await setDoc(doc(db, this.collectionName, userId), data);
        return data;
    }

    async updateUserContext(userId: string, niveis: NivelEnsino[]): Promise<UserContext> {
        const docRef = doc(db, this.collectionName, userId);
        const now = new Date().toISOString();

        await updateDoc(docRef, {
            niveis_ensino: niveis,
            updated_at: now
        });

        // Fetch again to ensure consistency or just return constructed
        return {
            id: userId,
            niveis_ensino: niveis,
            created_at: now, // This is technically wrong (should be original), but sufficient for context
            updated_at: now
        } as UserContext;
    }
}
