-- 観光地タブの「おすすめ」5件を実データとして揃える。
-- (フロント側の固定順表示は js/pages/category.js の RECOMMENDED_SPOT_IDS を参照)
--
-- 1. 해운대해수욕장(Haeundae Beach)は TourAPI 収集データに存在しない
--    (0013で目視データ削除後、実データ収集でも該当POIが取得されなかった)。
--    実座標・実写真つきの新規行として追加する。
-- 2. 자갈치시장(tour-132190)は experience カテゴリでのみ存在し、観光地タブに出ない。
--    観光地としても案内したいため tourist に変更する。

insert into spots (id, name_ko, name_ja, category, lat, lng, area, description_ja, tags, image_url, rating, admission, access_ja, hours_ja)
values (
  'haeundae-beach',
  '해운대해수욕장',
  '海雲台海水浴場',
  'tourist',
  35.1587,
  129.1604,
  '海雲台区',
  '海雲台海水浴場は、長さ1.5kmにわたる韓国最大級のビーチで、釜山を代表する観光スポットです。夏には100万人以上が訪れる人気のリゾートエリアで、ビーチ沿いにはホテルやレストラン、カフェが立ち並びます。地下鉄2号線 海雲台駅から徒歩圏内とアクセスも良く、夜には広安大橋のライトアップを遠くに望む夜景も楽しめます。',
  ARRAY['ビーチ','夏','ファミリー'],
  'https://images.unsplash.com/photo-1575907789733-c3dda018bae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
  4.7,
  '無料',
  '地下鉄2号線 海雲台駅から徒歩5分',
  '終日開放（夏季7〜8月混雑）'
)
on conflict (id) do nothing;

update spots set category = 'tourist' where id = 'tour-132190';
