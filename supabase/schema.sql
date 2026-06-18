-- ============================================================
-- TeamUp - Full Supabase Schema with RLS Policies
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  college text not null,
  location text,
  bio text,
  skills text[] default '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  email_visible boolean default false, -- only shown to post owner after application
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Hackathon participations (linked to profile)
create table public.hackathon_participations (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  event_name text not null,
  role text,
  result text, -- e.g., "Winner", "Finalist", "Participant"
  year integer,
  description text,
  created_at timestamptz default now()
);

-- Posts (team-finding listings)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null check (category in ('Hackathon', 'Team Project', 'Research', 'Startup', 'Design Challenge', 'Case Competition')),
  mode text not null check (mode in ('online', 'offline', 'hybrid')),
  location text, -- required if offline/hybrid
  team_size_needed integer not null check (team_size_needed > 0 and team_size_needed <= 20),
  skills_needed text[] default '{}',
  event_date date,
  deadline date, -- application deadline
  is_open boolean default true,
  upvotes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications to posts
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  skills text not null,
  message text not null, -- "why they want to join"
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(post_id, applicant_id) -- one application per post per user
);

-- Comments on posts (Reddit-style)
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade, -- for nested replies
  content text not null,
  upvotes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Votes on posts (to prevent double voting)
create table public.post_votes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Votes on comments
create table public.comment_votes (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.comments(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- Saved/bookmarked posts
create table public.saved_posts (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter integer := 0;
begin
  -- Generate username from email prefix
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'));
  final_username := base_username;

  -- Ensure uniqueness
  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into public.profiles (id, username, full_name, college, location)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'college', ''),
    coalesce(new.raw_user_meta_data->>'location', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-close posts after event date
create or replace function public.close_expired_posts()
returns void as $$
begin
  update public.posts
  set is_open = false
  where event_date < current_date and is_open = true;
end;
$$ language plpgsql security definer;

-- Update post upvote count
create or replace function public.update_post_upvotes()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set upvotes = upvotes + 1 where id = new.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set upvotes = upvotes - 1 where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_post_vote_change
  after insert or delete on public.post_votes
  for each row execute procedure public.update_post_upvotes();

-- Update comment upvote count
create or replace function public.update_comment_upvotes()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set upvotes = upvotes + 1 where id = new.comment_id;
  elsif TG_OP = 'DELETE' then
    update public.comments set upvotes = upvotes - 1 where id = old.comment_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_vote_change
  after insert or delete on public.comment_votes
  for each row execute procedure public.update_comment_upvotes();

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();

create trigger comments_updated_at before update on public.comments
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.hackathon_participations enable row level security;
alter table public.posts enable row level security;
alter table public.applications enable row level security;
alter table public.comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.comment_votes enable row level security;
alter table public.saved_posts enable row level security;

-- ---- PROFILES ----
-- Anyone can view LIMITED profile info (username, full_name, college only)
-- Full profile only visible to the profile owner
create policy "Public can view basic profile info"
  on public.profiles for select
  using (true); -- We handle field-level privacy in the app/views

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---- HACKATHON PARTICIPATIONS ----
create policy "Anyone can view hackathon participations"
  on public.hackathon_participations for select
  using (true);

create policy "Users can manage own hackathon participations"
  on public.hackathon_participations for all
  using (auth.uid() = profile_id);

-- ---- POSTS ----
create policy "Anyone can view open posts"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Post authors can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Post authors can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ---- APPLICATIONS ----
-- Applicant can see their own applications
-- Post owner can see all applications to their posts
-- No one else can see applications
create policy "Applicants can view own applications"
  on public.applications for select
  using (auth.uid() = applicant_id);

create policy "Post owners can view applications to their posts"
  on public.applications for select
  using (
    exists (
      select 1 from public.posts
      where posts.id = applications.post_id
      and posts.author_id = auth.uid()
    )
  );

create policy "Authenticated users can apply to posts"
  on public.applications for insert
  with check (
    auth.uid() = applicant_id
    and auth.uid() != (select author_id from public.posts where id = post_id)
  );

create policy "Applicants can delete own applications"
  on public.applications for delete
  using (auth.uid() = applicant_id);

create policy "Post owners can update application status"
  on public.applications for update
  using (
    exists (
      select 1 from public.posts
      where posts.id = applications.post_id
      and posts.author_id = auth.uid()
    )
  );

-- ---- COMMENTS ----
create policy "Anyone can view comments"
  on public.comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Authors can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ---- POST VOTES ----
create policy "Anyone can view post votes"
  on public.post_votes for select
  using (true);

create policy "Authenticated users can vote on posts"
  on public.post_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own post votes"
  on public.post_votes for delete
  using (auth.uid() = user_id);

-- ---- COMMENT VOTES ----
create policy "Anyone can view comment votes"
  on public.comment_votes for select
  using (true);

create policy "Authenticated users can vote on comments"
  on public.comment_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own comment votes"
  on public.comment_votes for delete
  using (auth.uid() = user_id);

-- ---- SAVED POSTS ----
create policy "Users can view own saved posts"
  on public.saved_posts for select
  using (auth.uid() = user_id);

create policy "Users can save posts"
  on public.saved_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave posts"
  on public.saved_posts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Public profile view (hides sensitive fields)
create or replace view public.public_profiles as
select
  id,
  username,
  full_name,
  college,
  skills,
  bio,
  github_url,
  portfolio_url,
  created_at
  -- location, linkedin, email are hidden from public view
from public.profiles;

-- Posts with author info (public safe)
create or replace view public.posts_with_authors as
select
  p.*,
  pr.username as author_username,
  pr.full_name as author_name,
  pr.college as author_college
from public.posts p
join public.profiles pr on pr.id = p.author_id;

-- ============================================================
-- INDEXES (Performance)
-- ============================================================
create index idx_posts_author on public.posts(author_id);
create index idx_posts_category on public.posts(category);
create index idx_posts_mode on public.posts(mode);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_event_date on public.posts(event_date);
create index idx_posts_is_open on public.posts(is_open);
create index idx_applications_post on public.applications(post_id);
create index idx_applications_applicant on public.applications(applicant_id);
create index idx_comments_post on public.comments(post_id);
create index idx_comments_parent on public.comments(parent_id);
create index idx_hackathons_profile on public.hackathon_participations(profile_id);
