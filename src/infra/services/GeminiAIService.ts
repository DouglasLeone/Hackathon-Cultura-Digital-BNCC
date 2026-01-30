
import { IAIService } from "../../model/services/IAIService";
import { Disciplina, Unidade, UserContext, PlanoAula, AtividadeAvaliativa, HabilidadeBNCC, SlideContent } from "../../model/entities";

export class GeminiAIService implements IAIService {

    private async callApi(action: string, payload: any): Promise<any> {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, payload }),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.error || `API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error calling API for action ${action}:`, error);
            throw error;
        }
    }

    async suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]> {
        try {
            return await this.callApi('suggestUnidades', { disciplina, context });
        } catch (error) {
            console.error("Error generating units:", error);
            return ["Não foi possível gerar sugestões agora. Tente novamente em instantes."];
        }
    }

    async generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext, enrichedContext?: string): Promise<Partial<PlanoAula>> {
        try {
            return await this.callApi('generatePlanoAula', { unidade, habilidadesBNCC, context, enrichedContext });
        } catch (error) {
            console.error("Error generating lesson plan:", error);
            return {
                titulo: "Ops! Algo deu errado",
                conteudo: "Não conseguimos gerar o plano de aula agora. Pode ser um problema de conexão ou a IA precisa de um descanso. Por favor, tente novamente."
            };
        }
    }

    async generateAtividade(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], options: import("../../model/services/IAIService").ActivityGenerationOptions, context?: UserContext): Promise<Partial<AtividadeAvaliativa>> {
        // Here we rely on the upper layer to catch errors or propagate, as per original contract
        return await this.callApi('generateAtividade', { unidade, habilidadesBNCC, options, context });
    }

    async generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<SlideContent[]> {
        try {
            return await this.callApi('generateSlides', { unidade, habilidadesBNCC, context });
        } catch (error) {
            console.error("Error generating slides:", error);
            return [
                { titulo: "Erro na geração", conteudo: ["Não foi possível gerar os slides pela IA."], anotacoes: "Tente novamente." }
            ];
        }
    }
}
