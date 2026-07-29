-- Phase 8에서 부산 전체 스팟(681건)을 TourAPI로 수집한 뒤로, preferred_areas의
-- spot_ids(랜드마크당 1~2개만 수동 큐레이션된 리스트, 0002에서 도입)는 너무
-- 빈약해졌다. 지역 상세 페이지는 이제 spot_ids 대신 랜드마크 좌표 기준
-- 반경 검색으로 주변 스팟을 보여준다 (js/pages/area-detail.js).

alter table preferred_areas
  add column if not exists lat double precision,
  add column if not exists lng double precision;

update preferred_areas set lat = 35.0975, lng = 129.0107 where id = 'gamcheon';
update preferred_areas set lat = 35.1587, lng = 129.1604 where id = 'haeundae';
update preferred_areas set lat = 35.0650, lng = 129.0771 where id = 'yeongdo';
update preferred_areas set lat = 35.1531, lng = 129.1186 where id = 'gwangalli';

alter table preferred_areas drop column if exists spot_ids;
