import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DIProvider } from "./di/DIContext";
import { DIContainer } from "./di/container";

const container = {
    getHomeDataUseCase: DIContainer.getHomeDataUseCase,
    getHistoricoUseCase: DIContainer.getHistoricoUseCase,
    logMaterialGenerationUseCase: DIContainer.logMaterialGenerationUseCase,
    deleteHistoricoUseCase: DIContainer.deleteHistoricoUseCase,
    getAllDisciplinasUseCase: DIContainer.getAllDisciplinasUseCase,
    getDisciplinaByIdUseCase: DIContainer.getDisciplinaByIdUseCase,
    createDisciplinaUseCase: DIContainer.createDisciplinaUseCase,
    updateDisciplinaUseCase: DIContainer.updateDisciplinaUseCase,
    deleteDisciplinaUseCase: DIContainer.deleteDisciplinaUseCase,
    suggestUnidadesUseCase: DIContainer.suggestUnidadesUseCase,
    getAllUnidadesUseCase: DIContainer.getAllUnidadesUseCase,
    getUnidadesByDisciplinaUseCase: DIContainer.getUnidadesByDisciplinaUseCase,
    getUnidadeByIdUseCase: DIContainer.getUnidadeByIdUseCase,
    createUnidadeUseCase: DIContainer.createUnidadeUseCase,
    updateUnidadeUseCase: DIContainer.updateUnidadeUseCase,
    deleteUnidadeUseCase: DIContainer.deleteUnidadeUseCase,
    generatePlanoAulaUseCase: DIContainer.generatePlanoAulaUseCase,
    generateAtividadeUseCase: DIContainer.generateAtividadeUseCase,
    generateSlidesUseCase: DIContainer.generateSlidesUseCase,
    updatePlanoAulaUseCase: DIContainer.updatePlanoAulaUseCase,
    updateAtividadeUseCase: DIContainer.updateAtividadeUseCase,
    updateSlidesUseCase: DIContainer.updateSlidesUseCase,
    getUserContextUseCase: DIContainer.getUserContextUseCase,
    createUserContextUseCase: DIContainer.createUserContextUseCase,
    updateUserContextUseCase: DIContainer.updateUserContextUseCase,
};

createRoot(document.getElementById("root")!).render(
    <DIProvider container={container}>
        <App />
    </DIProvider>
);
