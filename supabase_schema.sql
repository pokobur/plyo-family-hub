-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Questions Table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  body text not null,
  category text not null,
  author text not null default '匿名パパママ',
  likes integer default 0,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Answers Table
create table public.answers (
  id uuid default uuid_generate_v4() primary key,
  question_id uuid references public.questions(id) on delete cascade not null,
  body text not null,
  author text not null default '匿名パパママ',
  likes integer default 0,
  is_best boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Items Table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  image_url text,
  platform text not null, -- 'Amazon' or '楽天'
  original_url text not null,
  affiliate_url text,
  rating numeric(3,1) default 5.0,
  category text not null,
  author text not null default '匿名パパママ',
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- Allow anyone to read
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.items enable row level security;

create policy "Allow public read access on questions" on public.questions for select using (true);
create policy "Allow public read access on answers" on public.answers for select using (true);
create policy "Allow public read access on items" on public.items for select using (true);

-- Allow anyone to insert (Since we don't have auth yet, we allow anonymous inserts)
create policy "Allow public insert access on questions" on public.questions for insert with check (true);
create policy "Allow public insert access on answers" on public.answers for insert with check (true);
create policy "Allow public insert access on items" on public.items for insert with check (true);

-- Allow anyone to update likes/views
create policy "Allow public update access on questions" on public.questions for update using (true);
create policy "Allow public update access on answers" on public.answers for update using (true);
create policy "Allow public update access on items" on public.items for update using (true);
