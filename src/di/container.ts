
import { SupabaseGenIARepository } from '../infra/repositories/SupabaseGenIARepository';
import { SupabaseDisciplinaRepository } from '../infra/repositories/SupabaseDisciplinaRepository';
import { MockAIService } from '../infra/services/MockAIService';
import { GetHomeDataUseCase } from '../usecase/GetHomeDataUseCase';
import { GetAllDisciplinasUseCase } from '../usecase/GetAllDisciplinasUseCase';
import { GetDisciplinaByIdUseCase } from '../usecase/GetDisciplinaByIdUseCase';
import { CreateDisciplinaUseCase } from '../usecase/CreateDisciplinaUseCase';
import { UpdateDisciplinaUseCase } from '../usecase/UpdateDisciplinaUseCase';
import { DeleteDisciplinaUseCase } from '../usecase/DeleteDisciplinaUseCase';
import { SuggestUnidadesUseCase } from '../usecase/SuggestUnidadesUseCase';

class DIContainer {
    private static _genIARepository = new SupabaseGenIARepository();
    private static _disciplinaRepository = new SupabaseDisciplinaRepository();
    private static _aiService = new MockAIService();

    private static _getHomeDataUseCase = new GetHomeDataUseCase(this._genIARepository);
    private static _getAllDisciplinasUseCase = new GetAllDisciplinasUseCase(this._disciplinaRepository);
    private static _createDisciplinaUseCase = new CreateDisciplinaUseCase(this._disciplinaRepository);
    private static _updateDisciplinaUseCase = new UpdateDisciplinaUseCase(this._disciplinaRepository);
    private static _deleteDisciplinaUseCase = new DeleteDisciplinaUseCase(this._disciplinaRepository);
    private static _suggestUnidadesUseCase = new SuggestUnidadesUseCase(this._aiService);

    private static _getDisciplinaByIdUseCase = new GetDisciplinaByIdUseCase(this._disciplinaRepository);

    static get genIARepository() {
        return this._genIARepository;
    }

    static get getHomeDataUseCase() {
        return this._getHomeDataUseCase;
    }

    static get getAllDisciplinasUseCase() {
        return this._getAllDisciplinasUseCase;
    }

    static get getDisciplinaByIdUseCase() {
        return this._getDisciplinaByIdUseCase;
    }

    static get createDisciplinaUseCase() {
        return this._createDisciplinaUseCase;
    }

    static get updateDisciplinaUseCase() {
        return this._updateDisciplinaUseCase;
    }

    static get deleteDisciplinaUseCase() {
        return this._deleteDisciplinaUseCase;
    }

    static get suggestUnidadesUseCase() {
        return this._suggestUnidadesUseCase;
    }
}

export { DIContainer };
