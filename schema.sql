-- Users table with role management
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  role text check (role in ('admin', 'editor', 'user')) default 'user',
  created_at timestamp with time zone default now()
);

-- Gadgets table
create table gadgets (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  short_review text,
  image_url text,
  buy_link_1 text,
  buy_link_2 text,
  category text, -- e.g., 'TV', 'Phones', 'Soundbars', 'Sound Systems'
  specifications jsonb, -- Store detailed specs as structured JSON data
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Blog posts table
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  category text, -- e.g., 'TV', 'Phones', etc.
  image_url text,
  published_at timestamp with time zone default now(),
  created_by uuid references users(id) on delete set null
);

-- Scraped data table (temporary data before approval)
create table scraped_data (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  title text not null,
  short_review text,
  buy_link_1 text,
  buy_link_2 text,
  image_urls text[],
  category text,
  specifications jsonb,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  added_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS but allow API access
alter table scraped_data enable row level security;
create policy "Allow API access" on scraped_data
  for all using (true) with check (true);

-- Usage analytics table
create table page_visits (
  id bigint generated always as identity primary key,
  user_id uuid references users(id) on delete set null,
  page text not null,
  referrer text,
  user_agent text,
  visited_at timestamp with time zone default now()
);
