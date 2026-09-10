-- My Own Food (v0.0.95) — run this in Supabase's SQL editor.
--
-- Safe to run twice: every statement is guarded.
--
-- WHAT IS STORED HERE, and what is not.
--
-- A row is a food the user defined: a name, a picture, one amount, and the
-- four macros FOR that amount. Not per 100g — what the user typed, exactly
-- as they typed it, so the edit form can show it back to them unchanged.
-- The per-100g figures the rest of the app runs on are derived at read
-- time (utils/customFoods.js), which is a division rather than a second
-- source of truth that could drift.
--
-- Logged entries do NOT read back from here. insertEntry copies the name
-- and the macros onto the entry row, so editing a custom food changes what
-- you log NEXT, never what you already logged. That is deliberate: your
-- history is a record of what you ate, not a view over your current
-- definitions.

create table if not exists public.custom_foods (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,

  name         text not null,
  -- 'glyph:hamburger' for one of the twelve vector icons, or
  -- 'art:fruit_apple_dried' for one of the 1,737 drawn food icons. One
  -- column with a prefix rather than two, so the two kinds cannot be
  -- confused for each other.
  icon         text not null,

  -- 'weight' (g/ml/oz — re-portionable, because there is something to
  -- divide) or 'count' (bowl/slice/cup — logged in whole units, same as
  -- eggs already are).
  serving_type text not null check (serving_type in ('weight', 'count')),
  unit         text not null,
  amount       numeric not null check (amount > 0),

  calories     numeric not null check (calories >= 0),
  protein      numeric not null check (protein  >= 0),
  carbs        numeric not null check (carbs    >= 0),
  fat          numeric not null check (fat      >= 0),

  -- Drives the score's quality component. Without it, a takeaway logged
  -- here would score as clean eating, because the scorer decides what is
  -- junk by resolving an entry back to a food's category, and a custom
  -- food has none. See utils/score.js's FLAGGED.
  fast_food    boolean not null default false,

  -- Soft delete. A hard delete would leave every entry ever logged from
  -- this food unable to find its picture. Name and macros live on the
  -- entry itself, so those survive either way.
  deleted_at   timestamptz,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The only query this table serves: one user's undeleted foods, newest last.
create index if not exists custom_foods_user_idx
  on public.custom_foods (user_id, created_at)
  where deleted_at is null;

alter table public.custom_foods enable row level security;

-- One policy for all four verbs. `using` gates what you can see and
-- change; `with check` stops you writing a row owned by someone else.
drop policy if exists "custom_foods are private to their owner" on public.custom_foods;
create policy "custom_foods are private to their owner"
  on public.custom_foods
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- PostgREST caches the schema and will answer PGRST204 ("column not
-- found") for a table it has not seen yet. This is the step that was
-- missed when the `diet` column went in for v0.0.70.
notify pgrst, 'reload schema';
