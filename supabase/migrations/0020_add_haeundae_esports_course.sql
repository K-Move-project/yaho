-- 이유정님이 전달한 해운대 중심 1日코스(비치→전통시장→레트로오락실→T1베이스캠프→해리단길→THE BAY 101)를 추가한다.
-- "おすすめコース" 목록에서 2번째로 노출되도록, budget_level=2(westbusan/haeundae-gijang/seomyeon-gwangalliと同じ)
-- 이면서 created_at을 그 3건의 공유 타임스탬프(2026-07-30T09:19:30.7866+00:00)보다 앞서게 지정한다.
-- (js/api/courses.jsのorder: featured desc, budget_level asc, created_at asc 기준으로
--  1위=oryukdo-gwangalli-2days(budget_level 1), 2위=본 코스가 되도록 계산함)

insert into courses
  (id, title_ja, subtitle_ja, budget_level, budget_label, duration_label, schedule, tips_ja, tags, description_ja, image_url, featured, created_at)
values
(
  'haeundae-esports-1day',
  '海雲台満喫！eスポーツ×ローカル体験 1日コース',
  'ビーチ散策からeスポーツ体験、夜景まで欲張りに満喫',
  2, '¥6,000〜', '1日',
  '[
    {"time":"10:00","spot":"海雲台海水浴場","duration":"60分","note":"釜山旅行の定番フォトスポット。朝の散歩に最適","category":"tourist","lat":35.1587,"lng":129.1604},
    {"time":"11:00","spot":"海雲台伝統市場","duration":"90分","note":"シアッホットク(種入りホットク)などローカルグルメの食べ歩き","category":"food","lat":35.1615,"lng":129.1622},
    {"time":"12:30","spot":"ワンミミゲームセンター海雲台店","duration":"90分","note":"レトロなゲームセンターの雰囲気を体験。UFOキャッチャーやリズムゲームなど","category":"experience","lat":35.1621,"lng":129.1605},
    {"time":"14:00","spot":"T1ベースキャンプ 釜山店","duration":"180分","note":"PC房＋グッズショップ＋T1パブ、eスポーツ文化のメイン体験","category":"experience","lat":35.1610,"lng":129.1614,"spot_id":"t1-basecamp-busan"},
    {"time":"17:00","spot":"ヘリダンギル","duration":"120分","note":"感性カフェ通りを散策、写真スポットも豊富","category":"food","lat":35.1648,"lng":129.1576},
    {"time":"19:00","spot":"THE BAY 101","duration":"90分","note":"夜景を眺めながら一日を締めくくる","category":"experience","lat":35.1566,"lng":129.1520}
  ]'::jsonb,
  ARRAY[
    'T1ベースキャンプは時間制料金なので、長く遊ぶほどお得です。現地で順番待ちになることもあるため、平日の訪問がおすすめです。',
    'ワンミミゲームセンターは現金・カードのチャージ機がエラーになったという口コミがあるため、少額だけチャージして利用するのがおすすめです。',
    'ヘリダンギルからTHE BAY 101までは徒歩20分以上かかるため、タクシーや市内バス（1001番、200番など）の利用が便利です。'
  ],
  ARRAY['eスポーツ', 'レトロ', 'ローカル体験'],
  '海雲台エリアでビーチ散策からご当地グルメ、レトロゲームセンター、eスポーツ体験、カフェ通り、夜景まで一日で満喫できる欲張りコース。',
  '../assets/t1-basecamp-busan.png',
  true,
  '2026-07-30T09:19:00+00:00'
)
on conflict (id) do update set
  title_ja = excluded.title_ja,
  subtitle_ja = excluded.subtitle_ja,
  budget_level = excluded.budget_level,
  budget_label = excluded.budget_label,
  duration_label = excluded.duration_label,
  schedule = excluded.schedule,
  tips_ja = excluded.tips_ja,
  tags = excluded.tags,
  description_ja = excluded.description_ja,
  image_url = excluded.image_url,
  featured = excluded.featured,
  created_at = excluded.created_at;
