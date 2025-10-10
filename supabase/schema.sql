-- Create waitlist table
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  phone text,
  zip_code text,
  referral_code text unique default substring(md5(random()::text) from 1 for 8),
  referred_by uuid references public.waitlist(id),
  position integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Create index on email for faster lookups
create index if not exists waitlist_email_idx on public.waitlist(email);
create index if not exists waitlist_referral_code_idx on public.waitlist(referral_code);
create index if not exists waitlist_referred_by_idx on public.waitlist(referred_by);
create index if not exists waitlist_created_at_idx on public.waitlist(created_at);

-- Create RLS policies
alter table public.waitlist enable row level security;

create policy "Waitlist entries are viewable by everyone"
  on public.waitlist for select
  using (true);

create policy "Anyone can insert waitlist entries"
  on public.waitlist for insert
  with check (true);

-- Create function to update position when new entry is added
create or replace function update_waitlist_position()
returns trigger as $$
begin
  -- Update position based on creation order
  update public.waitlist
  set position = (
    select count(*)
    from public.waitlist
    where created_at <= new.created_at
  )
  where id = new.id;

  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update position
create trigger update_waitlist_position_trigger
  after insert on public.waitlist
  for each row
  execute function update_waitlist_position();

-- Create analytics table for tracking engagement
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  user_id uuid references public.waitlist(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists analytics_events_type_idx on public.analytics_events(event_type);
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at);

-- Enable RLS for analytics
alter table public.analytics_events enable row level security;

create policy "Analytics events are insertable by everyone"
  on public.analytics_events for insert
  with check (true);

-- Create content generation table for Claude SDK
create table if not exists public.generated_content (
  id uuid default gen_random_uuid() primary key,
  content_type text not null, -- 'tiktok', 'youtube', 'instagram', 'commercial'
  prompt text not null,
  generated_text text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists generated_content_type_idx on public.generated_content(content_type);
create index if not exists generated_content_created_at_idx on public.generated_content(created_at);

-- Enable RLS for generated content
alter table public.generated_content enable row level security;

create policy "Generated content is viewable by everyone"
  on public.generated_content for select
  using (true);

create policy "Generated content is insertable by service role"
  on public.generated_content for insert
  with check (true);
