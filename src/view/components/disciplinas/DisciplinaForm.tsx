import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Textarea } from '@/view/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/view/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/view/components/ui/select';
import { SERIES_OPTIONS, SERIES_FUNDAMENTAL, SERIES_MEDIO } from '@/model/entities';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DIContainer } from '@/di/container';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  serie: z.string().min(1, 'Selecione uma série'),
  area: z.string().min(1, 'Selecione uma área de conhecimento'),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DisciplinaFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function DisciplinaForm({ defaultValues, onSubmit, isLoading }: DisciplinaFormProps) {
  const [seriesOptions, setSeriesOptions] = useState<readonly string[]>([]);

  useEffect(() => {
    // Basic userId fetch from local storage for simpler context
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setSeriesOptions(SERIES_OPTIONS);
      return;
    }

    DIContainer.getUserContextUseCase.execute(userId).then(ctx => {
      if (ctx && ctx.niveis_ensino) {
        let options: string[] = [];
        if (ctx.niveis_ensino.includes('Ensino Fundamental')) {
          options = [...options, ...SERIES_FUNDAMENTAL];
        }
        if (ctx.niveis_ensino.includes('Ensino Médio')) {
          options = [...options, ...SERIES_MEDIO];
        }
        setSeriesOptions(options.length > 0 ? options : SERIES_OPTIONS);
      } else {
        setSeriesOptions(SERIES_OPTIONS);
      }
    }).catch(err => {
      console.error("Failed to load user context for series filtering", err);
      setSeriesOptions(SERIES_OPTIONS);
    });
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      serie: '',
      area: '',
      descricao: '',
      ...defaultValues,
    },
  });

  const showAreaField = !defaultValues?.area;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {showAreaField && (
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área do Conhecimento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Linguagens, Matemática..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!showAreaField && (
          <input type="hidden" {...form.register('area')} />
        )}

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Disciplina</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: História, Geografia..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Série/Ano</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seriesOptions.map((serie) => (
                    <SelectItem key={serie} value={serie}>
                      {serie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os objetivos e foco da disciplina..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {defaultValues?.nome ? 'Salvar Alterações' : 'Criar Disciplina'}
        </Button>
      </form>
    </Form>
  );
}
