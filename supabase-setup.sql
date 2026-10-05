-- משלים החתמות: הגדרת ענן ב-Supabase
-- מריצים פעם אחת ב-SQL Editor. נוגע רק בטבלה ובתיקייה (bucket) של האפליקציה הזאת,
-- כך שאפשר להריץ אותו בפרויקט שכבר משמש אפליקציות אחרות.

-- 1. פרטים אישיים וחתימה
create table if not exists public.attendance_profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  id_number   text,
  signature   text,              -- PNG כ-data URL
  updated_at  timestamptz default now()
);
alter table public.attendance_profiles enable row level security;

drop policy if exists "attendance_profiles own select" on public.attendance_profiles;
drop policy if exists "attendance_profiles own insert" on public.attendance_profiles;
drop policy if exists "attendance_profiles own update" on public.attendance_profiles;
drop policy if exists "attendance_profiles own delete" on public.attendance_profiles;
create policy "attendance_profiles own select" on public.attendance_profiles for select to authenticated using (auth.uid() = user_id);
create policy "attendance_profiles own insert" on public.attendance_profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "attendance_profiles own update" on public.attendance_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attendance_profiles own delete" on public.attendance_profiles for delete to authenticated using (auth.uid() = user_id);

-- 2. תיקיית קבצים פרטית: כל משתמש רואה רק את התיקייה <user id>/ שלו
insert into storage.buckets (id, name, public)
values ('attendance', 'attendance', false)
on conflict (id) do nothing;

drop policy if exists "attendance files select" on storage.objects;
drop policy if exists "attendance files insert" on storage.objects;
drop policy if exists "attendance files update" on storage.objects;
drop policy if exists "attendance files delete" on storage.objects;
create policy "attendance files select" on storage.objects for select to authenticated
  using (bucket_id = 'attendance' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attendance files insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'attendance' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attendance files update" on storage.objects for update to authenticated
  using (bucket_id = 'attendance' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attendance files delete" on storage.objects for delete to authenticated
  using (bucket_id = 'attendance' and (storage.foldername(name))[1] = auth.uid()::text);
