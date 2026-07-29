-- Phase 2: 초기 스키마 (docs/CLAUDE.md 4장 기준)
-- id는 UUID 대신 사람이 읽을 수 있는 slug(text)를 기본키로 사용한다.
-- 프론트에서 쿼리스트링(?id=gamcheon 등)으로 그대로 참조하기 위함.

create table if not exists spots (
  id text primary key,
  name_ko text,
  name_ja text not null,
  category text not null check (category in ('tourist', 'food', 'stay', 'experience')),
  lat double precision,
  lng double precision,
  area text,
  description_ja text,
  tags text[] not null default '{}',
  image_url text,
  rating numeric(2, 1),
  admission text,
  access_ja text,
  hours_ja text,
  created_at timestamptz not null default now()
);

create index if not exists spots_category_idx on spots (category);
create index if not exists spots_area_idx on spots (area);

create table if not exists preferred_areas (
  id text primary key,
  area_name_ja text not null,
  area_name_ko text,
  description_ja text,
  image_url text,
  preference_score numeric(2, 1),
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id text primary key,
  title_ja text not null,
  subtitle_ja text,
  budget_level smallint check (budget_level between 1 and 3),
  budget_label text,
  duration_label text,
  spot_ids text[] not null default '{}',
  schedule jsonb not null default '[]',
  tips_ja text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- status는 화면에 노출되는 일본어 라벨(開催中 등)이 아니라, JS가 start_date/end_date로
-- 다시 계산하기 전까지 참고할 수 있는 정규화된 값을 저장한다 (docs/CLAUDE.md Phase 6 참고).
create table if not exists festivals (
  id text primary key,
  title_ja text not null,
  title_sub_ko text,
  description_ja text,
  area text,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('upcoming', 'ongoing', 'ended')),
  image_url text,
  spot_id text references spots (id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists festivals_status_idx on festivals (status);
create index if not exists festivals_date_range_idx on festivals (start_date, end_date);

-- RLS: 전부 읽기 전용 공개 데이터. anon/authenticated에게 SELECT만 허용하고
-- INSERT/UPDATE/DELETE 정책은 만들지 않는다 (service_role 키는 RLS를 우회하므로
-- 관리자는 그 키로만 쓰기 작업을 수행한다).
alter table spots enable row level security;
alter table preferred_areas enable row level security;
alter table courses enable row level security;
alter table festivals enable row level security;

create policy "spots_public_read" on spots for select to anon, authenticated using (true);
create policy "preferred_areas_public_read" on preferred_areas for select to anon, authenticated using (true);
create policy "courses_public_read" on courses for select to anon, authenticated using (true);
create policy "festivals_public_read" on festivals for select to anon, authenticated using (true);
