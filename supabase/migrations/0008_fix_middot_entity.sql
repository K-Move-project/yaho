-- enrich-spots.mjs의 cleanText가 &middot; HTML 엔티티를 디코딩하지 않던 버그로
-- description_ja에 "&middot;"가 그대로 남아있던 2건을 고친다.
-- (스크립트 자체도 함께 수정해 이후 실행분은 처음부터 정상 반영된다.)

update spots set
  description_ja = replace(description_ja, '&middot;', '・')
where id in ('tour-2029553', 'tour-2709768');
