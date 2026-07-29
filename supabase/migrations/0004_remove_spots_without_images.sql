-- 사진이 없는 스팟은 카드에 플레이스홀더만 뜨고 볼거리가 없어 추천 목록에서 제외한다.
-- festivals.spot_id는 on delete set null이라 안전하게 처리되고,
-- preferred_areas.spot_ids/courses.schedule[].spot_id는 FK가 아니라서
-- 참조가 남아도 해당 화면에서 조용히 걸러질 뿐 에러가 나지 않는다.
delete from spots where image_url is null;
