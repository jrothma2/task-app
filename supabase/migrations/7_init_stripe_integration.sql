-- Stripe integration
-- Note: The Stripe Foreign Data Wrapper setup is commented out as it requires
-- proper configuration through Supabase's wrappers extension.
-- To set up Stripe integration, you can either:
-- 1. Use Supabase Edge Functions to interact with Stripe API
-- 2. Set up the Stripe wrapper following Supabase's documentation:
--    https://supabase.com/docs/guides/database/extensions/wrappers

-- Create schema for Stripe-related objects (if using FDW later)
create schema if not exists stripe;

-- Function to handle Stripe customer creation
-- This is a placeholder that can be updated when Stripe integration is properly configured
-- For now, it's disabled to allow migrations to run successfully
create or replace function public.handle_stripe_customer_creation()
returns trigger
security definer
set search_path = public
as $$
declare
  customer_email text;
begin
  -- Get user email
  select email into customer_email
  from auth.users
  where id = new.user_id;

  -- TODO: Implement Stripe customer creation via Edge Function or properly configured FDW
  -- For now, this function does nothing but allows the trigger to exist
  -- You can call a Supabase Edge Function here to create the Stripe customer
  
  return new;
end;
$$ language plpgsql;

-- Trigger to create Stripe customer on profile creation
-- Commented out until Stripe integration is properly configured
-- create trigger create_stripe_customer_on_profile_creation
--   before insert on public.profiles
--   for each row
--   execute function public.handle_stripe_customer_creation();

-- Function to handle Stripe customer deletion
-- This is a placeholder that can be updated when Stripe integration is properly configured
create or replace function public.handle_stripe_customer_deletion()
returns trigger
security definer
set search_path = public
as $$
begin
  if old.stripe_customer_id is not null then
    -- TODO: Implement Stripe customer deletion via Edge Function or properly configured FDW
    -- For now, this function does nothing but allows the trigger to exist
    raise notice 'Stripe customer deletion not yet implemented for customer: %', old.stripe_customer_id;
  end if;
  return old;
end;
$$ language plpgsql;

-- Trigger to delete Stripe customer on profile deletion
-- Commented out until Stripe integration is properly configured
-- create trigger delete_stripe_customer_on_profile_deletion
--   before delete on public.profiles
--   for each row
--   execute function public.handle_stripe_customer_deletion();

-- Security policy: Users can read their own Stripe data
create policy "Users can read own Stripe data"
  on public.profiles
  for select
  using (auth.uid() = user_id);