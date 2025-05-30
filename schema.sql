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
  -- New structured fields
  network_technology text,
  launch_announced text,
  launch_status text,
  body_dimensions text,
  body_weight text,
  body_build text,
  body_sim text,
  display_type text,
  display_size text,
  display_resolution text,
  display_protection text,
  platform_os text,
  platform_chipset text,
  platform_cpu text,
  platform_gpu text,
  memory_internal text,
  main_camera text,
  main_camera_features text,
  main_camera_video text,
  selfie_camera text,
  selfie_camera_video text,
  sound_loudspeaker text,
  sound_3_5mm_jack text,
  comms_wlan text,
  comms_bluetooth text,
  comms_positioning text,
  comms_nfc text,
  comms_radio text,
  comms_usb text,
  features_sensors text,
  battery_type text,
  battery_charging text,
  misc_colors text,
  misc_models text,
  misc_price text,
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
  image_urls text[],
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  buy_link_1 text,
  buy_link_2 text,
  category text,
  -- Same structured fields as gadgets table
  network_technology text,
  launch_announced text,
  launch_status text,
  body_dimensions text,
  body_weight text,
  body_build text,
  body_sim text,
  display_type text,
  display_size text,
  display_resolution text,
  display_protection text,
  platform_os text,
  platform_chipset text,
  platform_cpu text,
  platform_gpu text,
  memory_internal text,
  main_camera text,
  main_camera_features text,
  main_camera_video text,
  selfie_camera text,
  selfie_camera_video text,
  sound_loudspeaker text,
  sound_3_5mm_jack text,
  comms_wlan text,
  comms_bluetooth text,
  comms_positioning text,
  comms_nfc text,
  comms_radio text,
  comms_usb text,
  features_sensors text,
  battery_type text,
  battery_charging text,
  misc_colors text,
  misc_models text,
  misc_price text,
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
