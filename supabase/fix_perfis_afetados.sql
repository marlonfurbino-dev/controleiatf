-- ============================================================
-- Script para corrigir perfis que pagaram mas não foram marcados
-- como assinante=true por bug nas Edge Functions quick-task/check-pix.
--
-- COMO USAR:
--   1. Abra o Supabase Dashboard → SQL Editor
--   2. Se souber o e-mail do usuário, use o UPDATE por email (bloco A)
--   3. Se souber o user_id, use o UPDATE por id (bloco B)
--   4. Para encontrar usuários afetados, use a query de diagnóstico (bloco C)
-- ============================================================

-- ── BLOCO A: Corrigir por e-mail ─────────────────────────────────────────
-- Substitua 'email@do.usuario' pelo e-mail real de cada usuário afetado.
UPDATE perfis
SET
  assinante = true,
  plano     = 'anual'   -- ou 'mensal', conforme o plano pago
WHERE email = 'email@do.usuario';

-- ── BLOCO B: Corrigir por user_id ────────────────────────────────────────
-- Substitua 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' pelo ID real.
UPDATE perfis
SET
  assinante = true,
  plano     = 'anual'
WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

-- ── BLOCO C: Diagnóstico — listar todos os usuários não assinantes
--            que criaram conta há mais de 7 dias (trial expirado)
--            e que portanto deveriam ter sido bloqueados.
--            Use este resultado para identificar quem pagou mas não foi atualizado.
SELECT
  id,
  email,
  nome,
  sobrenome,
  assinante,
  plano,
  created_at
FROM perfis
WHERE
  assinante IS NOT TRUE
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
