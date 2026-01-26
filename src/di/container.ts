
import { FirestoreGenIARepository } from '../infra/repositories/firestore/FirestoreGenIARepository';
import { FirestoreDisciplinaRepository } from '../infra/repositories/firestore/FirestoreDisciplinaRepository';
import { FirestoreUnidadeRepository } from '../infra/repositories/firestore/FirestoreUnidadeRepository';
import { GeminiAIService } from '../infra/services/GeminiAIService';
import { BNCCRepository } from '../infra/repositories/BNCCRepository'; // Added
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
import { UpdateSlidesUseCase } from '../usecase/UpdateSlidesUseCase';
import { LogMaterialGenerationUseCase } from '../usecase/LogMaterialGenerationUseCase';
import { DeleteHistoricoUseCase } from '../usecase/DeleteHistoricoUseCase';
import { FirestoreUserRepository } from '../infra/repositories/firestore/FirestoreUserRepository';
import { GetUserContextUseCase } from '../usecase/GetUserContextUseCase';
import { CreateUserContextUseCase } from '../usecase/CreateUserContextUseCase';
import { UpdateUserContextUseCase } from '../usecase/UpdateUserContextUseCase';
import { GetHistoricoUseCase } from '../usecase/GetHistoricoUseCase';
import { EnrichThemeUseCase } from '../usecase/EnrichThemeUseCase';
import { ValidatePedagogicalQualityUseCase } from '../usecase/ValidatePedagogicalQualityUseCase';

class DIContainer {
    private static _genIARepository = new FirestoreGenIARepository();
    private static _disciplinaRepository = new FirestoreDisciplinaRepository();
    private static _unidadeRepository = new FirestoreUnidadeRepository();
    private static _userRepository = new FirestoreUserRepository();
    private static _bnccRepository = new BNCCRepository(); // Added
    private static _aiService = new GeminiAIService();

    private static _getHomeDataUseCase = new GetHomeDataUseCase(
        this._genIARepository,
        this._disciplinaRepository,
        this._unidadeRepository
    );
    private static _getHistoricoUseCase = new GetHistoricoUseCase(this._genIARepository);
    private static _logMaterialGenerationUseCase = new LogMaterialGenerationUseCase(this._genIARepository);
    private static _deleteHistoricoUseCase = new DeleteHistoricoUseCase(this._genIARepository);
    private static _getAllDisciplinasUseCase = new GetAllDisciplinasUseCase(this._disciplinaRepository);
    private static _getDisciplinaByIdUseCase = new GetDisciplinaByIdUseCase(this._disciplinaRepository);
    private static _createDisciplinaUseCase = new CreateDisciplinaUseCase(this._disciplinaRepository);
    private static _updateDisciplinaUseCase = new UpdateDisciplinaUseCase(this._disciplinaRepository);
    private static _deleteDisciplinaUseCase = new DeleteDisciplinaUseCase(this._disciplinaRepository);
    private static _suggestUnidadesUseCase = new SuggestUnidadesUseCase(this._aiService, this._userRepository);

    private static _getAllUnidadesUseCase = new GetAllUnidadesUseCase(this._unidadeRepository);
    private static _getUnidadesByDisciplinaUseCase = new GetUnidadesByDisciplinaUseCase(this._unidadeRepository);
    private static _getUnidadeByIdUseCase = new GetUnidadeByIdUseCase(this._unidadeRepository);
    private static _createUnidadeUseCase = new CreateUnidadeUseCase(this._unidadeRepository);
    private static _updateUnidadeUseCase = new UpdateUnidadeUseCase(this._unidadeRepository);
    private static _deleteUnidadeUseCase = new DeleteUnidadeUseCase(this._unidadeRepository);
    private static _enrichThemeUseCase = new EnrichThemeUseCase();
    private static _validateQualityUseCase = new ValidatePedagogicalQualityUseCase();
    private static _generatePlanoAulaUseCase = new GeneratePlanoAulaUseCase(
        this._unidadeRepository,
        this._aiService,
        this._userRepository,
        this._bnccRepository,
        this._enrichThemeUseCase,
        this._validateQualityUseCase
    );
    private static _generateAtividadeUseCase = new GenerateAtividadeUseCase(this._unidadeRepository, this._aiService, this._userRepository, this._bnccRepository);
    private static _generateSlidesUseCase = new GenerateSlidesUseCase(this._aiService, this._bnccRepository, this._unidadeRepository);
    private static _updatePlanoAulaUseCase = new UpdatePlanoAulaUseCase(this._unidadeRepository, this._genIARepository);
    private static _updateAtividadeUseCase = new UpdateAtividadeUseCase(this._unidadeRepository, this._genIARepository);
    private static _updateSlidesUseCase = new UpdateSlidesUseCase(this._unidadeRepository, this._genIARepository);

    private static _getUserContextUseCase = new GetUserContextUseCase(this._userRepository);
    private static _createUserContextUseCase = new CreateUserContextUseCase(this._userRepository);
    private static _updateUserContextUseCase = new UpdateUserContextUseCase(this._userRepository);


    static get genIARepository() {
        return this._genIARepository;
    }

    static get unidadeRepository() {
        return this._unidadeRepository;
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

    static get getHistoricoUseCase() {
        return this._getHistoricoUseCase;
    }

    static get validatePedagogicalQualityUseCase() {
        return this._validateQualityUseCase;
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

    static get updateSlidesUseCase() {
        return this._updateSlidesUseCase;
    }

    static get getUserContextUseCase() {
        return this._getUserContextUseCase;
    }

    static get createUserContextUseCase() {
        return this._createUserContextUseCase;
    }

    static get updateUserContextUseCase() {
        return this._updateUserContextUseCase;
    }
}

export { DIContainer };
