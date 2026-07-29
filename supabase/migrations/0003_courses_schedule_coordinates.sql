-- Phase 7 후속 개선: schedule과 spot_ids를 손으로 계속 동기화해야 하는 구조라
-- 새 코스를 추가할 때마다 지도 동선이 일부만 표시되는 문제가 반복될 수 있었다.
-- schedule의 각 단계에 좌표(lat/lng)를 직접 포함시켜 지도가 schedule만 보고
-- 그리도록 하고, 더 이상 필요 없는 courses.spot_ids는 제거한다.
-- spot_id는 선택 항목으로, spots 테이블에 실제로 큐레이션된 스팟과 일치할 때만
-- 넣어 상세페이지 링크에 사용한다 (없어도 지도 표시에는 지장 없음).

update courses set schedule = '[
  {"time":"9:00","spot":"南浦洞BIFF広場","duration":"60分","note":"映画祭の聖地。手形プリントで記念撮影♪","category":"tourist","lat":35.0977,"lng":129.0306,"spot_id":"biff"},
  {"time":"10:00","spot":"国際市場","duration":"45分","note":"釜山最大の在来市場。B級グルメや雑貨が充実","category":"food","lat":35.1000,"lng":129.0295},
  {"time":"11:00","spot":"チャガルチ市場","duration":"90分","note":"新鮮な魚介を食べ比べ！海鮮丼は約¥900〜","category":"food","lat":35.0968,"lng":129.0306,"spot_id":"jagalchi"},
  {"time":"13:00","spot":"甘川文化村","duration":"120分","note":"カラフルな壁画の村。フォト撮影に最適！","category":"tourist","lat":35.0975,"lng":129.0107,"spot_id":"gamcheon"},
  {"time":"15:30","spot":"光復路","duration":"60分","note":"釜山一のショッピングストリート","category":"experience","lat":35.0986,"lng":129.0313}
]'::jsonb
where id = 'cospa';

update courses set schedule = '[
  {"time":"DAY1 10:00","spot":"広安里海岸","duration":"90分","note":"広安大橋を望む絶景ビーチ。カフェ巡りも◎","category":"tourist","lat":35.1531,"lng":129.1186,"spot_id":"gwangalli"},
  {"time":"DAY1 12:00","spot":"センタムシティ","duration":"120分","note":"世界最大規模のショッピングモールで昼食","category":"experience","lat":35.1691,"lng":129.1306},
  {"time":"DAY1 15:00","spot":"海雲台ビーチ","duration":"120分","note":"韓国最大の砂浜でゆったりひと息","category":"tourist","lat":35.1587,"lng":129.1604,"spot_id":"haeundae"},
  {"time":"DAY2 9:00","spot":"松亭海水浴場","duration":"90分","note":"地元の人が集まる穴場ビーチ","category":"tourist","lat":35.1783,"lng":129.1998},
  {"time":"DAY2 11:00","spot":"機張カニ市場","duration":"120分","note":"新鮮なカニを豪快に食す！¥2,000〜","category":"food","lat":35.2444,"lng":129.2144,"spot_id":"gijang"}
]'::jsonb
where id = 'coastal';

update courses set schedule = '[
  {"time":"10:00","spot":"国際市場グルメ路地","duration":"60分","note":"釜山名物の屋台グルメを食べ歩き","category":"food","lat":35.1000,"lng":129.0295},
  {"time":"11:30","spot":"チャガルチ海鮮","duration":"90分","note":"新鮮な海鮮を市場価格で堪能","category":"food","lat":35.0968,"lng":129.0306,"spot_id":"jagalchi"},
  {"time":"14:00","spot":"光復路スイーツ","duration":"60分","note":"話題のカフェとスイーツ巡り","category":"food","lat":35.0986,"lng":129.0313},
  {"time":"16:00","spot":"西面グルメ街","duration":"90分","note":"釜山っ子に人気のB級グルメが集結","category":"food","lat":35.1578,"lng":129.0594,"spot_id":"milmyeon"},
  {"time":"18:30","spot":"海雲台屋台村","duration":"90分","note":"夜の屋台でシメのグルメを","category":"food","lat":35.1587,"lng":129.1604,"spot_id":"haeundae"}
]'::jsonb
where id = 'food-tour';

alter table courses drop column if exists spot_ids;
