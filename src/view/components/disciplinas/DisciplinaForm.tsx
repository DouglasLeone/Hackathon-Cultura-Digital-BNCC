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
import { SERIES_OPTIONS, DISCIPLINAS_SUGERIDAS } from '@/model/entities';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  serie: z.string().min(1, 'Selecione uma série'),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DisciplinaFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function DisciplinaForm({ defaultValues, onSubmit, isLoading }: DisciplinaFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      serie: '',
      descricao: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Disciplina</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione ou digite o nome" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISCIPLINAS_SUGERIDAS.map((disc) => (
                    <SelectItem key={disc} value={disc}>
                      {disc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormControl>
                <Input 
                  placeholder="Ou digite um nome personalizado"
                  className="mt-2"
                  onChange={(e) => {
                    if (e.target.value) {
                      field.onChange(e.target.value);
                    }
                  }}
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
                  {SERIES_OPTIONS.map((serie) => (
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
