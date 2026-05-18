/*
  # Corrigir políticas RLS do histórico

  1. RLS Policies para fb_history
    - Adicionar política DELETE (estava faltando)
    - Garantir que apenas o próprio usuário pode deletar seu histórico

  2. Nota Importante
    - O bucket "component-images" deve ser criado manualmente no Supabase Dashboard
    - Storage > Buckets > Create new bucket
    - Nome: component-images
    - Publique: true
*/

-- Adicionar política DELETE para fb_history
CREATE POLICY "history_delete_own" ON fb_history FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));
