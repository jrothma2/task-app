-- Add background_color column to profiles table (if it doesn't exist)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'background_color'
  ) then
    alter table public.profiles
    add column background_color text check (background_color in ('light-blue', 'gradient', 'yellow', 'red', 'green')) default 'light-blue';
  end if;
end $$;

-- Security policy: Users can update their own profile (if it doesn't exist)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'profiles' 
    and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = user_id);
  end if;
end $$;

