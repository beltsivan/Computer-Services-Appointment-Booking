create or replace function public.get_customer_profiles(customer_ids uuid[])
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    au.id,
    coalesce(pu.email, au.email)::text as email,
    coalesce(
      nullif(trim(pu.first_name), ''),
      nullif(trim(au.raw_user_meta_data->>'first_name'), ''),
      nullif(trim(au.raw_user_meta_data->>'firstName'), ''),
      nullif(split_part(trim(coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')), ' ', 1), '')
    )::text as first_name,
    coalesce(
      nullif(trim(pu.last_name), ''),
      nullif(trim(au.raw_user_meta_data->>'last_name'), ''),
      nullif(trim(au.raw_user_meta_data->>'lastName'), ''),
      nullif(trim(regexp_replace(trim(coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')), '^\S+\s*', '')), '')
    )::text as last_name
  from auth.users au
  left join public.users pu on pu.id = au.id
  where au.id = any(customer_ids);
$$;

revoke all on function public.get_customer_profiles(uuid[]) from public;
grant execute on function public.get_customer_profiles(uuid[]) to authenticated;
