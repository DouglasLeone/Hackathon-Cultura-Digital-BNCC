import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Disciplina } from '@/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  disciplina_id: z.string().min(1, 'Selecione uma disciplina'),
  tema: z.string().min(3, 'Tema deve ter pelo menos 3 caracteres'),
  contexto_cultura_digital: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UnidadeFormProps {
  disciplinas: Disciplina[];
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function UnidadeForm({ disciplinas, defaultValues, onSubmit, isLoading }: UnidadeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disciplina_id: '',
      tema: '',
      contexto_cultura_digital: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="disciplina_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disciplina</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {disciplinas.map((disc) => (
                    <SelectItem key={disc.id} value={disc.id}>
                      {disc.nome} - {disc.serie}
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
          name="tema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema da Unidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução à Programação com Scratch" {...field} />
              </FormControl>
              <FormDescription>
                O tema principal que será abordado nesta aula
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contexto_cultura_digital"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contexto na Cultura Digital</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explique como este tema se relaciona com a Cultura Digital e competências da BNCC..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descreva a conexão com habilidades digitais e a BNCC
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {defaultValues?.tema ? 'Salvar Alterações' : 'Criar Unidade'}
        </Button>
      </form>
    </Form>
  );
}
