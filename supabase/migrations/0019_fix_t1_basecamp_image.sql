-- 0018을 image_url 없이(null) 먼저 실행한 경우를 위한 보정.
-- 0018은 on conflict (id) do nothing이라 재실행해도 기존 행이 갱신되지 않으므로,
-- 이미지 경로만 별도로 채워 넣는다.

update spots
set image_url = '../assets/t1-basecamp-busan.png'
where id = 't1-basecamp-busan';
