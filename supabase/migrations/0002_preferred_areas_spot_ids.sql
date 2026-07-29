-- Phase 4: 지역 상세 페이지의 "소속 스팟 리스트"를 위해, preferred_areas가
-- spots.area 문자열 매칭이 아니라 명시적으로 큐레이션된 spot_ids를 갖도록 한다
-- (courses.spot_ids와 동일한 패턴).

alter table preferred_areas
  add column if not exists spot_ids text[] not null default '{}';

-- 기존에 이미 seed된 4개 행 백필
update preferred_areas set spot_ids = ARRAY['gamcheon', 'guesthouse1'] where id = 'gamcheon';
update preferred_areas set spot_ids = ARRAY['haeundae', 'hotel1'] where id = 'haeundae';
update preferred_areas set spot_ids = ARRAY['yeongdo'] where id = 'yeongdo';
update preferred_areas set spot_ids = ARRAY['gwangalli'] where id = 'gwangalli';
