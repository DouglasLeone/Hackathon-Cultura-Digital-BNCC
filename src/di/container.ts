
import { SupabaseGenIARepository } from '../infra/repositories/SupabaseGenIARepository';
import { SupabaseDisciplinaRepository } from '../infra/repositories/SupabaseDisciplinaRepository';
import { SupabaseUnidadeRepository } from '../infra/repositories/SupabaseUnidadeRepository';
import { MockAIService } from '../infra/services/MockAIService';
import { GetHomeDataUseCase } from '../usecase/GetHomeDataUseCase';
import { GetAllDisciplinasUseCase } from '../usecase/GetAllDisciplinasUseCase';
import { GetDisciplinaByIdUseCase } from '../usecase/GetDisciplinaByIdUseCase';
import { CreateDisciplinaUseCase } from '../usecase/CreateDisciplinaUseCase';
import { UpdateDisciplinaUseCase } from '../usecase/UpdateDisciplinaUseCase';
import { DeleteDisciplinaUseCase } from '../usecase/DeleteDisciplinaUseCase';
import { SuggestUnidadesUseCase } from '../usecase/SuggestUnidadesUseCase';
import { GetAllUnidadesUseCase } from '../usecase/GetAllUnidadesUseCase';
import { GetUnidadesByDisciplinaUseCase } from '../usecase/GetUnidadesByDisciplinaUseCase';
import { GetUnidadeByIdUseCase } from '../usecase/GetUnidadeByIdUseCase';
import { CreateUnidadeUseCase } from '../usecase/CreateUnidadeUseCase';
import { UpdateUnidadeUseCase } from '../usecase/UpdateUnidadeUseCase';
import { DeleteUnidadeUseCase } from '../usecase/DeleteUnidadeUseCase';
import { GeneratePlanoAulaUseCase } from '../usecase/GeneratePlanoAulaUseCase';
import { GenerateAtividadeUseCase } from '../usecase/GenerateAtividadeUseCase';
import { GenerateSlidesUseCase } from '../usecase/GenerateSlidesUseCase';
import { UpdatePlanoAulaUseCase } from '../usecase/UpdatePlanoAulaUseCase';
import { UpdateAtividadeUseCase } from '../usecase/UpdateAtividadeUseCase';

class DIContainer {
    private static _genIARepository = new SupabaseGenIARepository();
    private static _disciplinaRepository = new SupabaseDisciplinaRepository();
    private static _unidadeRepository = new SupabaseUnidadeRepository();
    private static _aiService = new MockAIService();

    private static _getHomeDataUseCase = new GetHomeDataUseCase(
        this._genIARepository,
        this._disciplinaRepository,
        this._unidadeRepository
    );
    private static _logMaterialGenerationUseCase = new LogMaterialGenerationUseCase(this._genIARepository);
    private static _deleteHistoricoUseCase = new DeleteHistoricoUseCase(this._genIARepository);
    private static _getAllDisciplinasUseCase = new GetAllDisciplinasUseCase(this._disciplinaRepository);
    private static _getDisciplinaByIdUseCase = new GetDisciplinaByIdUseCase(this._disciplinaRepository);
    private static _createDisciplinaUseCase = new CreateDisciplinaUseCase(this._disciplinaRepository);
    private static _updateDisciplinaUseCase = new UpdateDisciplinaUseCase(this._disciplinaRepository);
    private static _deleteDisciplinaUseCase = new DeleteDisciplinaUseCase(this._disciplinaRepository);
    private static _suggestUnidadesUseCase = new SuggestUnidadesUseCase(this._aiService);

    private static _getAllUnidadesUseCase = new GetAllUnidadesUseCase(this._unidadeRepository);
    private static _getUnidadesByDisciplinaUseCase = new GetUnidadesByDisciplinaUseCase(this._unidadeRepository);
    private static _getUnidadeByIdUseCase = new GetUnidadeByIdUseCase(this._unidadeRepository);
    private static _createUnidadeUseCase = new CreateUnidadeUseCase(this._unidadeRepository);
    private static _updateUnidadeUseCase = new UpdateUnidadeUseCase(this._unidadeRepository);
    private static _deleteUnidadeUseCase = new DeleteUnidadeUseCase(this._unidadeRepository);
    private static _generatePlanoAulaUseCase = new GeneratePlanoAulaUseCase(this._unidadeRepository, this._aiService);
    private static _generateAtividadeUseCase = new GenerateAtividadeUseCase(this._unidadeRepository, this._aiService);
    private static _generateSlidesUseCase = new GenerateSlidesUseCase(this._aiService);
    private static _updatePlanoAulaUseCase = new UpdatePlanoAulaUseCase(this._unidadeRepository);
    private static _updateAtividadeUseCase = new UpdateAtividadeUseCase(this._unidadeRepository);


    static get genIARepository() {
        return this._genIARepository;
    }

    static get logMaterialGenerationUseCase() {
        return this._logMaterialGenerationUseCase;
    }

    static get deleteHistoricoUseCase() {
        return this._deleteHistoricoUseCase;
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

    static get getAllUnidadesUseCase() {
        return this._getAllUnidadesUseCase;
    }

    static get getUnidadesByDisciplinaUseCase() {
        return this._getUnidadesByDisciplinaUseCase;
    }

    static get getUnidadeByIdUseCase() {
        return this._getUnidadeByIdUseCase;
    }

    static get createUnidadeUseCase() {
        return this._createUnidadeUseCase;
    }

    static get updateUnidadeUseCase() {
        return this._updateUnidadeUseCase;
    }

    static get deleteUnidadeUseCase() {
        return this._deleteUnidadeUseCase;
    }

    static get generatePlanoAulaUseCase() {
        return this._generatePlanoAulaUseCase;
    }

    static get generateAtividadeUseCase() {
        return this._generateAtividadeUseCase;
    }

    static get generateSlidesUseCase() {
        return this._generateSlidesUseCase;
    }

    static get updatePlanoAulaUseCase() {
        return this._updatePlanoAulaUseCase;
    }

    static get updateAtividadeUseCase() {
        return this._updateAtividadeUseCase;
    }
}

export { DIContainer };
