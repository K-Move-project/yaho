-- 1) 기존 수동 큐레이션 스팟 2건의 area가 "구/군"이 아니라 그 안의 동네 이름으로
--    들어가 있었다 (西面은 釜山鎮区 소속, 南浦洞은 中区 소속). 부산 16개 구/군
--    표준 표기(scripts/collect-spots.mjs의 SIGUNGU_TO_DISTRICT_JA와 동일)로 통일한다.
update spots set area = '釜山鎮区' where id in ('milmyeon', 'kpop');
update spots set area = '中区' where id = 'hanbok';

-- 2) 코스 카드를 실사진/평점/하이라이트 태그로 보여주기 위해 컬럼을 추가한다.
alter table courses
  add column if not exists image_url text,
  add column if not exists rating numeric(2, 1),
  add column if not exists tags text[] not null default '{}',
  add column if not exists description_ja text;

update courses set
  image_url = 'https://images.unsplash.com/photo-1628532429788-c35922b5e6c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  rating = 4.8,
  tags = ARRAY['コスパ抜群', 'ローカル体験', 'フォトスポット多数'],
  description_ja = '釜山を初めて訪れる方にも、リピーターの方にもおすすめの鉄板コース。交通費+食費込みで¥5,000以内を目指せます。'
where id = 'cospa';

update courses set
  image_url = 'https://images.unsplash.com/photo-1591520284162-8e64eceebacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  rating = 4.7,
  tags = ARRAY['絶景ビーチ', '海鮮グルメ', '夜景'],
  description_ja = '釜山の美しい海岸線を2日間かけてじっくり巡るコース。夕日・夜景・海鮮グルメを全部制覇！'
where id = 'coastal';

update courses set
  image_url = 'https://images.unsplash.com/photo-1549282138-86f0a2e1b8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  rating = 4.9,
  tags = ARRAY['食べ歩き', '地元グルメ', '低予算'],
  description_ja = '釜山のB級グルメを一日かけて食べ歩き。ミルミョンやオムクなど必食グルメを制覇！'
where id = 'food-tour';
