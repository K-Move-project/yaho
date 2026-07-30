-- 네이버 검색 결과에서 가져오는 방문자 리뷰 수를 저장할 컬럼을 추가한다.
-- rating(기존 컬럼, numeric(2,1))과 함께 scripts/scrape-naver-ratings.mjs가 채운다.

alter table spots
  add column if not exists review_count integer;
