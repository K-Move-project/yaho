-- Phase 1~2에서 실제 데이터 연동 전 손으로 채워넣은 목업 스팟 6건과, 이를 참조하던
-- 가짜 행사 3건(Unsplash 사진 + 가짜 설명문)을 제거한다. 이제 spots/festivals 모두
-- TourAPI/Visit Busan에서 수집한 실제 데이터로 채워져 있어 더 이상 필요 없다.
-- festivals.spot_id는 on delete set null이라 순서는 상관없지만, 명시적으로 먼저 지운다.

delete from festivals where id in ('ocean-festival', 'biff', 'fireworks');
delete from spots where id in ('gamcheon', 'haeundae', 'yeongdo', 'gwangalli', 'guesthouse1', 'hotel1');
