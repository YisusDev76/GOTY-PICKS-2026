-- Ejecuta esto una sola vez en Supabase > SQL Editor.

create table if not exists public.boletas (
  id          text primary key,                       -- id corto, ej. "k3x9a2bq"
  nombre      text check (char_length(nombre) <= 30),
  codigo      text not null check (codigo ~ '^[0-9a-z_]{3,90}$'),
  creada_en   timestamptz not null default now()
);

-- Row Level Security: la llave "anon" es pública, así que limitamos qué puede hacer.
alter table public.boletas enable row level security;

-- Cualquiera puede crear una boleta...
create policy "crear boletas" on public.boletas
  for insert to anon with check (true);

-- ...y cualquiera puede leerla si tiene el link.
create policy "leer boletas" on public.boletas
  for select to anon using (true);

-- No hay políticas de update ni delete: nadie puede editar ni borrar boletas ajenas.
