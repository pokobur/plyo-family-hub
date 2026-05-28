-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Questions Table
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
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
  user_id uuid references auth.users(id) on delete set null,
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
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null,
  image_url text,
  platform text not null,
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

-- Allow authenticated users to insert
create policy "Allow authenticated insert access on questions" on public.questions for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated insert access on answers" on public.answers for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated insert access on items" on public.items for insert with check (auth.role() = 'authenticated');

-- Allow only owners to update or delete their entries
create policy "Allow owner update access on questions" on public.questions for update using (auth.uid() = user_id);
create policy "Allow owner update access on answers" on public.answers for update using (auth.uid() = user_id);
create policy "Allow owner update access on items" on public.items for update using (auth.uid() = user_id);

create policy "Allow owner delete access on questions" on public.questions for delete using (auth.uid() = user_id);
create policy "Allow owner delete access on answers" on public.answers for delete using (auth.uid() = user_id);
create policy "Allow owner delete access on items" on public.items for delete using (auth.uid() = user_id);

-- 4. Create Gift Board Tables

-- 4-1. Create Gift Items Table
create table public.gift_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  images text[] not null default '{}',
  category text not null,
  condition text not null,
  delivery_method text not null,
  prefecture text not null,
  city text not null,
  location_hint text,
  status text not null default 'open',
  selected_receiver_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4-2. Create Gift Applications Table
create table public.gift_applications (
  id uuid default uuid_generate_v4() primary key,
  gift_item_id uuid references public.gift_items(id) on delete cascade not null,
  applicant_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(gift_item_id, applicant_id)
);

-- 4-3. Create Gift Messages Table
create table public.gift_messages (
  id uuid default uuid_generate_v4() primary key,
  gift_item_id uuid references public.gift_items(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for Gift Board
alter table public.gift_items enable row level security;
alter table public.gift_applications enable row level security;
alter table public.gift_messages enable row level security;

-- 4-4. gift_items RLS Policies
create policy "Allow public read access on gift_items" on public.gift_items for select using (true);
create policy "Allow auth insert on gift_items" on public.gift_items for insert with check (auth.role() = 'authenticated');
create policy "Allow owner update on gift_items" on public.gift_items for update using (auth.uid() = user_id);
create policy "Allow owner delete on gift_items" on public.gift_items for delete using (auth.uid() = user_id);

-- 4-5. gift_applications RLS Policies
create policy "Allow owner or applicant read on gift_applications" on public.gift_applications for select 
using (
  auth.uid() = applicant_id or 
  auth.uid() in (select user_id from public.gift_items where id = gift_item_id)
);
create policy "Allow auth insert on gift_applications" on public.gift_applications for insert with check (auth.role() = 'authenticated');
create policy "Allow applicant update on gift_applications" on public.gift_applications for update using (auth.uid() = applicant_id);
create policy "Allow applicant delete on gift_applications" on public.gift_applications for delete using (auth.uid() = applicant_id);

-- 4-6. gift_messages RLS Policies
create policy "Allow matched participants read on gift_messages" on public.gift_messages for select
using (
  auth.uid() in (
    select user_id from public.gift_items where id = gift_item_id
    union
    select selected_receiver_id from public.gift_items where id = gift_item_id
  )
);
create policy "Allow matched participants insert on gift_messages" on public.gift_messages for insert
with check (
  auth.uid() = sender_id and (
    auth.uid() in (
      select user_id from public.gift_items where id = gift_item_id
      union
      select selected_receiver_id from public.gift_items where id = gift_item_id
    )
  )
);
