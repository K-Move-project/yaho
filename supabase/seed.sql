-- Phase 2: 목 데이터 seed
-- 출처: 1차_시안.zip(Figma export)의 HomePage/CategoryPage/SpotDetailPage/
-- CourseDetailPage/EventDetailPage mock 데이터를 실제 테이블 구조에 맞게 옮겨 담았다.
-- (카피/데이터는 참고용 mock이며, 실데이터는 Phase 8 TourAPI 연동에서 대체된다.)

-- ---------------------------------------------------------------------------
-- spots
-- ---------------------------------------------------------------------------
insert into spots (id, name_ko, name_ja, category, lat, lng, area, description_ja, tags, image_url, rating, admission, access_ja, hours_ja) values
('gamcheon', '감천문화마을', '甘川文化村', 'tourist', 35.0975, 129.0107, '沙下区',
  '甘川文化村は釜山を代表するフォトスポット。急斜面に色とりどりの家々が並び、その美しい景観から「韓国のマチュピチュ」「韓国のサントリーニ島」と呼ばれています。壁画アートやインスタ映えスポットが豊富で、SNSで話題の場所です。村内には小さなカフェやお土産店も点在しています。',
  ARRAY['フォトスポット','アート','壁画'],
  'https://images.unsplash.com/photo-1672671187899-a10f547341f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.8, '2,000ウォン（約¥230）', '地下鉄1号線 土城駅からタクシー10分', '9:00 – 18:00（通年）'),
('haeundae', '해운대 해수욕장', '海雲台ビーチ', 'tourist', 35.1587, 129.1604, '海雲台区',
  '海雲台は長さ1.5kmにわたる韓国最大の砂浜。夏季には100万人以上が訪れる超人気スポットです。ビーチ沿いにはホテルやレストランが立ち並び、アクセスも抜群。夜にはライトアップされた広安大橋を遠くに望む絶景が楽しめます。',
  ARRAY['ビーチ','夏','ファミリー'],
  'https://images.unsplash.com/photo-1591520284162-8e64eceebacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.7, '無料', '地下鉄2号線 海雲台駅から徒歩5分', '終日開放（夏季7〜8月混雑）'),
('gwangalli', null, '広安里海岸', 'tourist', 35.1531, 129.1186, '水営区',
  '広安大橋の夜景を一望できる海辺の散歩道。カフェやレストランが立ち並び、夜景スポットとしても人気です。',
  ARRAY['海','夜景','花火'],
  'https://images.unsplash.com/photo-1724618194655-c3c12254d61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.6, null, null, null),
('yeongdo', null, '影島スカイウォーク', 'tourist', 35.0650, 129.0771, '影島区',
  '海に張り出した展望デッキから絶景を楽しめる、影島の穴場スポットです。',
  ARRAY['絶景','展望台','橋'],
  'https://images.unsplash.com/photo-1719176373099-ef363272af49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.3, null, null, null),
('jagalchi', null, 'チャガルチ市場', 'food', 35.0968, 129.0306, '中区',
  '新鮮な海鮮を市場価格で味わえる、釜山を代表する在来市場です。',
  ARRAY['海鮮','市場','新鮮'],
  'https://images.unsplash.com/photo-1628532429788-c35922b5e6c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.6, '¥1,000〜', null, null),
('milmyeon', null, '釜山ミルミョン通り', 'food', 35.1578, 129.0594, '西面',
  '釜山名物のミルミョン（冷麺）が味わえる、地元で人気の食堂が集まる通りです。',
  ARRAY['麺料理','B級グルメ','地元'],
  'https://images.unsplash.com/photo-1549282138-86f0a2e1b8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.5, '¥800〜', null, null),
('gijang', null, '機張カニ市場', 'food', 35.2444, 129.2144, '機張郡',
  '旬のワタリガニを豪快に味わえる、釜山近郊で人気の海鮮市場です。',
  ARRAY['カニ','海鮮','季節'],
  'https://images.unsplash.com/photo-1560724774-ce5f6c5a7978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.7, '¥2,000〜', null, null),
('hotel1', null, 'パラダイスホテル釜山', 'stay', 35.1586, 129.1601, '海雲台区',
  '海雲台ビーチのすぐそばに位置する、海の眺めが自慢の高級ホテルです。',
  ARRAY['高級','海ビュー','スパ'],
  'https://images.unsplash.com/photo-1776439287079-f95b22f287b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.8, '¥20,000〜', null, null),
('guesthouse1', null, '甘川文化村ゲストハウス', 'stay', 35.0975, 129.0107, '沙下区',
  '甘川文化村のすぐそばにある、コストパフォーマンスに優れたゲストハウスです。',
  ARRAY['ゲストハウス','文化村','コスパ'],
  'https://images.unsplash.com/photo-1652383584390-163622ae1b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.5, '¥3,000〜', null, null),
('biff', null, 'BIFF広場・映画体験', 'experience', 35.0977, 129.0306, '中区',
  '釜山国際映画祭の舞台となる広場。映画スターの手形プリントめぐりが人気です。',
  ARRAY['映画','エンタメ','文化'],
  'https://images.unsplash.com/photo-1695730435725-861079fcf917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.5, null, null, null),
('kpop', null, 'K-POPダンス体験', 'experience', 35.1578, 129.0594, '西面',
  '本格的なK-POPダンスレッスンが受けられる、旅行者にも人気の体験スタジオです。',
  ARRAY['K-POP','ダンス','体験'],
  'https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.7, '¥2,000〜', null, null),
('hanbok', null, '韓服レンタル体験', 'experience', 35.0985, 129.0312, '南浦洞',
  '伝統韓服を着て街歩きができる人気の体験。フォトスポット巡りにおすすめです。',
  ARRAY['韓服','伝統','フォト'],
  'https://images.unsplash.com/photo-1711887540798-9d7d720e5319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  4.6, '¥1,500〜', null, null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- preferred_areas
-- ---------------------------------------------------------------------------
insert into preferred_areas (id, area_name_ja, area_name_ko, description_ja, image_url, preference_score, spot_ids) values
('gamcheon', '甘川文化村', '감천문화마을', 'カラフルな壁画と路地が有名',
  'https://images.unsplash.com/photo-1672671187899-a10f547341f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', 4.8,
  ARRAY['gamcheon', 'guesthouse1']),
('haeundae', '海雲台', '해운대', '韓国最大の海水浴場',
  'https://images.unsplash.com/photo-1591520284162-8e64eceebacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', 4.7,
  ARRAY['haeundae', 'hotel1']),
('yeongdo', '影島', '영도', '穴場の絶景スカイウォーク',
  'https://images.unsplash.com/photo-1724618194655-c3c12254d61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', 4.6,
  ARRAY['yeongdo']),
('gwangalli', '広安里', '광안리', '広安大橋の夜景が絶景',
  'https://images.unsplash.com/photo-1719176373099-ef363272af49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600', 4.6,
  ARRAY['gwangalli'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- courses
-- spot_ids는 schedule에 등장하는 스팟 중, 위 spots 시드에 실제로 존재하는 것만 연결한 부분 목록이다.
-- ---------------------------------------------------------------------------
insert into courses (id, title_ja, subtitle_ja, budget_level, budget_label, duration_label, spot_ids, schedule, tips_ja) values
('cospa', '1日 コスパコース', '少ない予算で最大限楽しむ！', 1, '¥5,000〜', '1日（約7時間）',
  ARRAY['biff','jagalchi','gamcheon'],
  '[
    {"time":"9:00","spot":"南浦洞BIFF広場","duration":"60分","note":"映画祭の聖地。手形プリントで記念撮影♪","category":"tourist"},
    {"time":"10:00","spot":"国際市場","duration":"45分","note":"釜山最大の在来市場。B級グルメや雑貨が充実","category":"food"},
    {"time":"11:00","spot":"チャガルチ市場","duration":"90分","note":"新鮮な魚介を食べ比べ！海鮮丼は約¥900〜","category":"food"},
    {"time":"13:00","spot":"甘川文化村","duration":"120分","note":"カラフルな壁画の村。フォト撮影に最適！","category":"tourist"},
    {"time":"15:30","spot":"光復路","duration":"60分","note":"釜山一のショッピングストリート","category":"experience"}
  ]'::jsonb,
  ARRAY[
    '地下鉄1日乗車券（約¥560）を活用すると交通費を節約できます',
    'チャガルチ市場は午前中が食材が新鮮でおすすめ',
    '甘川文化村へはタクシーが便利（南浦洞から約10分・¥700程度）'
  ]),
('coastal', '2日 海沿いコース', '釜山の絶景ビーチを満喫！', 3, '¥8,000〜', '2日間',
  ARRAY['gwangalli','haeundae','gijang'],
  '[
    {"time":"DAY1 10:00","spot":"広安里海岸","duration":"90分","note":"広安大橋を望む絶景ビーチ。カフェ巡りも◎","category":"tourist"},
    {"time":"DAY1 12:00","spot":"センタムシティ","duration":"120分","note":"世界最大規模のショッピングモールで昼食","category":"experience"},
    {"time":"DAY1 15:00","spot":"海雲台ビーチ","duration":"120分","note":"韓国最大の砂浜でゆったりひと息","category":"tourist"},
    {"time":"DAY2 9:00","spot":"松亭海水浴場","duration":"90分","note":"地元の人が集まる穴場ビーチ","category":"tourist"},
    {"time":"DAY2 11:00","spot":"機張カニ市場","duration":"120分","note":"新鮮なカニを豪快に食す！¥2,000〜","category":"food"}
  ]'::jsonb,
  ARRAY[
    '海雲台周辺のホテルに泊まると移動が楽です（¥3,000〜）',
    '広安大橋の夜景は必見！夕方以降に訪れましょう',
    '機張カニは9〜11月がシーズン'
  ]),
('food-tour', 'グルメ集中コース', '釜山B級グルメを食べ歩き！', 2, '¥6,000〜', '1日（約8時間）',
  ARRAY['jagalchi','milmyeon'],
  '[
    {"time":"10:00","spot":"国際市場グルメ路地","duration":"60分","note":"釜山名物の屋台グルメを食べ歩き","category":"food"},
    {"time":"11:30","spot":"チャガルチ海鮮","duration":"90分","note":"新鮮な海鮮を市場価格で堪能","category":"food"},
    {"time":"14:00","spot":"光復路スイーツ","duration":"60分","note":"話題のカフェとスイーツ巡り","category":"food"},
    {"time":"16:00","spot":"西面グルメ街","duration":"90分","note":"釜山っ子に人気のB級グルメが集結","category":"food"},
    {"time":"18:30","spot":"海雲台屋台村","duration":"90分","note":"夜の屋台でシメのグルメを","category":"food"}
  ]'::jsonb,
  ARRAY[
    '空腹で挑むと食べすぎ注意！少量ずつ色々試すのがコツ',
    'ミルミョン（밀면）とオムク（어묵）は釜山名物なので必食',
    '現金（ウォン）を多めに用意しておきましょう'
  ])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- festivals
-- status는 seed 시점(2026-07-29) 기준 값이다. 실제 상태는 Phase 6에서 화면단이
-- start_date/end_date로 다시 계산하므로, 이 값은 초기 참고값일 뿐이다.
-- ---------------------------------------------------------------------------
insert into festivals (id, title_ja, title_sub_ko, description_ja, area, start_date, end_date, status, image_url, spot_id, tags) values
('ocean-festival', '釜山海洋祭り', '부산 바다축제',
  '「釜山海洋祭り」は、釜山市が誇る夏の一大イベント。1996年から毎年開催され、海洋スポーツ大会、砂の彫刻展示、野外コンサート、花火ショーなど多彩なプログラムが催されます。夜はライブステージと光のショーが幻想的な雰囲気を演出し、旅の思い出に残る特別な体験を提供します。',
  '海雲台区', '2026-07-25', '2026-08-03', 'ongoing',
  'https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'haeundae', ARRAY['夏','海','ファミリー','花火']),
('biff', '釜山国際映画祭', '부산국제영화제 BIFF',
  '1996年創設のアジアを代表する国際映画祭。世界70か国以上から約300作品が上映され、映画スターも多数来釜します。野外上映「オープンシネマ」は無料で観覧でき、一般市民も映画祭の雰囲気を楽しめます。南浦洞BIFF広場では映画スターの手形プリントなども楽しめます。',
  '南浦洞', '2026-10-01', '2026-10-10', 'upcoming',
  'https://images.unsplash.com/photo-1776439287079-f95b22f287b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'biff', ARRAY['映画','文化','エンタメ','レッドカーペット']),
('fireworks', '釜山花火祭り', '부산 불꽃축제',
  '広安大橋と広安里ビーチを舞台に、約60分にわたって打ち上げられる花火大会。毎年約100万人が訪れる釜山最大の秋のイベントです。音楽に合わせた演出が美しく、SNSでも大きな話題になります。',
  '水営区', '2026-10-25', '2026-10-25', 'upcoming',
  'https://images.unsplash.com/photo-1695730435725-861079fcf917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'gwangalli', ARRAY['花火','夜景','秋'])
on conflict (id) do nothing;
