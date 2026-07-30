-- 사용자가 직접 작성해 전달한 코스 5건을 추천 코스 탭에 추가한다.
-- 우선순위 노출을 위해 featured 컬럼을 추가하고, 이 5건만 true로 설정한다
-- (js/api/courses.js에서 featured desc, budget_level asc 순으로 정렬).
-- 사진은 아직 없어 image_url은 null로 둔다.

alter table courses
  add column if not exists featured boolean not null default false;

insert into courses
  (id, title_ja, subtitle_ja, budget_level, budget_label, duration_label, schedule, tips_ja, tags, description_ja, featured)
values
(
  'haeundae-gijang-2days',
  '海雲台・機張 2日コース',
  '絶景ビーチ＆日帰り旅気分の東部エリア',
  2, '¥9,000〜', '2日',
  '[
    {"time":"DAY1 12:00","spot":"海雲台伝統市場・クナムロ","duration":"60分","note":"ミルミョンや豚クッパなどご当地グルメの昼食","category":"food","lat":35.1614,"lng":129.1606},
    {"time":"DAY1 13:00","spot":"海雲台海水浴場＆アクアリウム","duration":"210分","note":"韓国最大級のビーチ＋アクアリウム（¥2,500）","category":"tourist","lat":35.1587,"lng":129.1604},
    {"time":"DAY1 16:30","spot":"青沙浦（ブルーライン観光列車）","duration":"90分","note":"海沿いを走るスカイカプセル（¥1,500）","category":"tourist","lat":35.1604442358,"lng":129.1922189785},
    {"time":"DAY1 18:00","spot":"冬柏島","duration":"90分","note":"海岸散策路で夕日鑑賞","category":"tourist","lat":35.153991438,"lng":129.1521809693},
    {"time":"DAY1 20:00","spot":"THE BAY 101","duration":"90分","note":"マリンシティの夜景を眺めながら一杯（¥1,000〜）","category":"experience","lat":35.1554,"lng":129.1489},
    {"time":"DAY2 9:00","spot":"海東龍宮寺","duration":"120分","note":"海沿いに建つ絶景寺院","category":"tourist","lat":35.188283368,"lng":129.2235599308},
    {"time":"DAY2 12:00","spot":"オシリア地区グルメ","duration":"90分","note":"地元の人気店でランチ（¥1,000〜）","category":"food","lat":35.1974852256,"lng":129.2294674968},
    {"time":"DAY2 13:00","spot":"ロッテプレミアムアウトレット東釜山店","duration":"180分","note":"機張の海沿いオーシャンビューカフェ or ショッピング（¥1,000〜）","category":"experience","lat":35.1922299485,"lng":129.2127940917}
  ]'::jsonb,
  ARRAY['宿泊は1日目の動線終了地点かつ2日目の出発地点である海雲台や松亭エリアがおすすめ。移動時間を大幅に短縮できます。'],
  ARRAY['絶景ビーチ', '日帰り温泉気分', 'グルメ'],
  '海雲台と機張エリアの絶景ビーチと海鮮グルメ、寺院巡りを満喫する2日間。',
  true
),
(
  'westbusan-2days',
  '原都心（西釜山エリア）2日コース',
  'カラフルな村と海辺の絶景、レトロな下町散策',
  2, '¥8,000〜', '2日',
  '[
    {"time":"DAY1 10:00","spot":"甘川文化村","duration":"180分","note":"カラフルな壁画の村。フォト撮影に最適！","category":"tourist","lat":35.0975,"lng":129.0107},
    {"time":"DAY1 13:00","spot":"松島海辺の食堂","duration":"60分","note":"海を眺めながらランチ（¥1,000〜）","category":"food","lat":35.0739256715,"lng":129.016458847},
    {"time":"DAY1 14:00","spot":"松島海上ケーブルカー＆スカイパーク","duration":"180分","note":"海の上を渡るケーブルカー（¥3,500）","category":"experience","lat":35.0774,"lng":129.017},
    {"time":"DAY1 17:00","spot":"松島松林公園・海水浴場","duration":"90分","note":"海辺でのんびり夕方散歩","category":"tourist","lat":35.0789056952,"lng":129.0178502571},
    {"time":"DAY2 10:00","spot":"チャガルチ市場＆国際市場・BIFF広場","duration":"180分","note":"新鮮な海鮮とB級グルメ食べ歩き（¥1,000〜）","category":"food","lat":35.0968,"lng":129.0306},
    {"time":"DAY2 13:00","spot":"龍頭山公園・釜山タワー展望台","duration":"120分","note":"釜山タワーからの街並み一望（¥1,000）","category":"tourist","lat":35.1004841098,"lng":129.0326928231},
    {"time":"DAY2 15:00","spot":"ロッテ百貨店 光復店","duration":"90分","note":"ショッピングで締めくくり","category":"experience","lat":35.0968,"lng":129.0289}
  ]'::jsonb,
  ARRAY[
    '南浦洞駅〜チャガルチ駅周辺に宿泊すると、1日目（バス・タクシーで松島・甘川へ移動しやすい）も2日目（徒歩移動可能）も効率よく回れます。',
    '南浦洞から甘川文化村や松島まではタクシーで約10〜15分（料金6,000〜8,000ウォン程度）。2人以上なら公共交通よりタクシーの方が時間と体力を大幅に節約できます。'
  ],
  ARRAY['フォトスポット', 'ローカル市場', 'ケーブルカー'],
  '甘川文化村や松島、チャガルチ市場など釜山の原点ともいえる原都心エリアを巡る2日間。',
  true
),
(
  'oryukdo-gwangalli-2days',
  '五六島・広安里 2日コース',
  '絶景海岸トレッキングとビーチ夜景',
  1, '¥5,000〜', '2日',
  '[
    {"time":"DAY1 10:00","spot":"五六島スカイウォーク","duration":"60分","note":"海の上のガラス張り展望台","category":"tourist","lat":35.1016495355,"lng":129.1230988205},
    {"time":"DAY1 12:00","spot":"龍湖洞グルメ探訪","duration":"60分","note":"地元で人気の食堂でランチ","category":"food","lat":35.1198,"lng":129.1156},
    {"time":"DAY1 13:00","spot":"二妓台海岸散策路","duration":"180分","note":"断崖絶壁沿いの絶景トレッキングコース","category":"tourist","lat":35.1319,"lng":129.1219},
    {"time":"DAY1 16:00","spot":"広安里海水浴場","duration":"180分","note":"広安大橋の夜景を眺めながらひと休み","category":"tourist","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 10:00","spot":"広安里オーシャンビューカフェ","duration":"180分","note":"海辺のカフェ巡りと散歩","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 13:00","spot":"広安里グルメ探訪","duration":"60分","note":"人気店でランチ","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 14:00","spot":"広安里雑貨店通り","duration":"120分","note":"個性派ショップ巡り","category":"experience","lat":35.1521,"lng":129.1178},
    {"time":"DAY2 16:00","spot":"水辺公園","duration":"60分","note":"水営江沿いの公園でのんびり","category":"tourist","lat":35.1583,"lng":129.1201}
  ]'::jsonb,
  ARRAY[
    '広安里海水浴場のすぐ前に宿泊するのが断然おすすめ。1日目のトレッキング後も移動が楽で、夜いつでも広安大橋の夜景を楽しめます。',
    '二妓台海岸散策路の全区間（4.7km）がきつければ、トンセンマルからオウルマダンまでの往復（約1時間コース）だけにして、車で五六島に移動してスカイウォークだけ見る方法で大幅に時間短縮できます。'
  ],
  ARRAY['絶景トレッキング', 'コスパ抜群', '夜景'],
  '五六島スカイウォークから二妓台海岸散策路、広安里の夜景まで。自然の絶景を満喫するコスパ抜群コース。',
  true
),
(
  'seomyeon-gwangalli-2days',
  '西面・広安里 2日コース',
  'カフェ通りとナイトビーチを一度に',
  2, '¥7,000〜', '2日',
  '[
    {"time":"DAY1 11:00","spot":"西面","duration":"120分","note":"釜山随一の繁華街を散策","category":"experience","lat":35.1578,"lng":129.0594},
    {"time":"DAY1 13:00","spot":"田浦カフェ通り","duration":"120分","note":"おしゃれなカフェが並ぶ人気エリア","category":"food","lat":35.1587281711,"lng":129.0642801508},
    {"time":"DAY1 15:00","spot":"三井タワー","duration":"180分","note":"ショッピング＆文化体験","category":"experience","lat":35.1547,"lng":129.0596},
    {"time":"DAY1 18:00","spot":"広安里海水浴場","duration":"120分","note":"広安大橋の夜景鑑賞","category":"tourist","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 10:00","spot":"広安里オーシャンビューカフェ","duration":"180分","note":"海辺のカフェ巡りと散歩","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 13:00","spot":"広安里グルメ探訪","duration":"60分","note":"人気店でランチ","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 14:00","spot":"広安里雑貨店通り","duration":"120分","note":"個性派ショップ巡り","category":"experience","lat":35.1521,"lng":129.1178},
    {"time":"DAY2 16:00","spot":"水辺公園","duration":"60分","note":"水営江沿いの公園でのんびり","category":"tourist","lat":35.1583,"lng":129.1201}
  ]'::jsonb,
  ARRAY[
    'ショッピングや夜のグルメを楽しみたいなら西面駅近く、朝起きて海を眺めたいなら2日目の広安里ビーチ沿いのオーシャンビュー宿泊がおすすめ。',
    '西面駅→広安駅（地下鉄2号線）で約18〜20分と、公共交通機関の利用が最も便利です。'
  ],
  ARRAY['カフェ巡り', 'ショッピング', '夜景'],
  '西面の繁華街と田浦カフェ通りを楽しんだ後、広安里の夜景で締めくくる、街歩きと海辺を両方満喫できるコース。',
  true
),
(
  'seomyeon-centum-gwangalli-3days',
  '西面・センタムシティ・広安 3日コース',
  'ショッピング・展示・ビーチを3日間で満喫',
  3, '¥12,000〜', '3日',
  '[
    {"time":"DAY1 11:00","spot":"西面","duration":"120分","note":"釜山随一の繁華街を散策","category":"experience","lat":35.1578,"lng":129.0594},
    {"time":"DAY1 13:00","spot":"田浦カフェ通り","duration":"120分","note":"おしゃれなカフェが並ぶ人気エリア","category":"food","lat":35.1587281711,"lng":129.0642801508},
    {"time":"DAY1 15:00","spot":"三井タワー","duration":"180分","note":"ショッピング＆文化体験","category":"experience","lat":35.1547,"lng":129.0596},
    {"time":"DAY1 18:00","spot":"広安里海水浴場","duration":"120分","note":"広安大橋の夜景鑑賞","category":"tourist","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 10:00","spot":"広安里オーシャンビューカフェ","duration":"180分","note":"海辺のカフェ巡りと散歩","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 13:00","spot":"広安里グルメ探訪","duration":"60分","note":"人気店でランチ","category":"food","lat":35.1531,"lng":129.1186},
    {"time":"DAY2 14:00","spot":"広安里雑貨店通り","duration":"120分","note":"個性派ショップ巡り","category":"experience","lat":35.1521,"lng":129.1178},
    {"time":"DAY2 16:00","spot":"新世界百貨店スパランド","duration":"180分","note":"韓国最大級のスパ施設でリラックス（¥3,500）","category":"experience","lat":35.1687865886,"lng":129.1297408475},
    {"time":"DAY3 10:00","spot":"BEXCO","duration":"180分","note":"展示会・イベントを見学","category":"tourist","lat":35.1691116738,"lng":129.1363347095},
    {"time":"DAY3 13:00","spot":"APECナル公園","duration":"120分","note":"水営江沿いの散策路をのんびり歩く","category":"tourist","lat":35.1697,"lng":129.1264},
    {"time":"DAY3 15:00","spot":"新世界百貨店","duration":"120分","note":"ショッピングで締めくくり","category":"experience","lat":35.1687865886,"lng":129.1297408475}
  ]'::jsonb,
  ARRAY[
    '広安里海水浴場周辺での宿泊がおすすめ。',
    '西面駅→センタムシティ駅→広安駅（地下鉄2号線）で約30分と、公共交通機関の利用が最も便利です。'
  ],
  ARRAY['ショッピング', '展示', 'スパ'],
  '西面のカフェ通りから広安里の夜景、センタムシティのスパやBEXCOでの展示まで、釜山の魅力を3日間じっくり満喫するコース。',
  true
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
  featured = excluded.featured;
