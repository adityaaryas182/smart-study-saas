-- =============================================================
-- Migration: 0002_generate_and_persist.sql
-- Fungsi RPC atomik: insert soal + potong kredit + catat ledger.
-- Terjemahan "Step 3" Sequence Diagram. Dipanggil HANYA dari backend
-- via service role. Seluruh body = 1 transaksi (atomik).
-- =============================================================

create or replace function public.generate_and_persist(
  p_user_id     uuid,
  p_material_id uuid,
  p_questions   jsonb,             -- array: [{question_text, options, correct_answer}, ...]
  p_cost        integer default 1
)
returns jsonb
language plpgsql
security invoker                   -- dipanggil via service role (sudah full akses)
as $$
declare
  v_current_credits integer;
  v_new_balance     integer;
  v_owner           uuid;
  v_inserted        jsonb;
begin
  -- 1) Materi harus ada & milik user ini (service role bypass RLS, jadi cek manual).
  select user_id into v_owner
  from public.materials
  where id = p_material_id;

  if v_owner is null then
    raise exception 'MATERIAL_NOT_FOUND';
  end if;
  if v_owner <> p_user_id then
    raise exception 'MATERIAL_FORBIDDEN';
  end if;

  -- 2) Kunci baris user & cek kredit DI DALAM transaksi (race-safe).
  select credits into v_current_credits
  from public.users
  where id = p_user_id
  for update;

  if v_current_credits is null then
    raise exception 'USER_NOT_FOUND';
  end if;
  if v_current_credits < p_cost then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  -- 3) Insert semua soal (sudah tervalidasi Zod di backend).
  with inserted as (
    insert into public.questions (material_id, question_text, options, correct_answer)
    select p_material_id, q.question_text, q.options, q.correct_answer
    from jsonb_to_recordset(p_questions) as q(
      question_text  text,
      options        jsonb,
      correct_answer text
    )
    returning id, question_text, options, correct_answer
  )
  select jsonb_agg(to_jsonb(inserted)) into v_inserted from inserted;

  if v_inserted is null then
    raise exception 'NO_QUESTIONS';       -- array kosong / tak ada yang ter-insert
  end if;

  -- 4) Potong kredit PALING AKHIR. CHECK (credits >= 0) = jaring pengaman terakhir.
  update public.users
  set credits = credits - p_cost
  where id = p_user_id
  returning credits into v_new_balance;

  -- 5) Catat di ledger (append-only).
  insert into public.credit_transactions (user_id, amount, reason, balance_after)
  values (p_user_id, -p_cost, 'generation', v_new_balance);

  -- 6) Kembalikan hasil ke backend.
  return jsonb_build_object(
    'new_balance', v_new_balance,
    'questions',   v_inserted
  );
end;
$$;

-- KEAMANAN: cabut akses client langsung; hanya service role (backend) yang boleh.
revoke execute on function public.generate_and_persist(uuid, uuid, jsonb, integer) from anon, authenticated;
grant  execute on function public.generate_and_persist(uuid, uuid, jsonb, integer) to service_role;