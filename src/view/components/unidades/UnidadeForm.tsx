
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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  tema: z.string().min(2, 'Tema deve ter pelo menos 2 caracteres'),
  contexto_cultura_digital: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface UnidadeFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function UnidadeForm({ defaultValues, onSubmit, isLoading }: UnidadeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
          name="tema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema da Aula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução à Algoritmos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contexto_cultura_digital"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contexto de Cultura Digital (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Como este tema se relaciona com a cultura digital..."
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
          {defaultValues?.tema ? 'Salvar Alterações' : 'Criar Unidade'}
        </Button>
      </form>
    </Form>
  );
}
