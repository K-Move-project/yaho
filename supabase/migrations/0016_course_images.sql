-- 0015에서 사진 없이 추가했던 코스 5건에 Unsplash 사진을 채운다.
-- 내용에 맞는 실사진을 검색해 URL이 실제로 로드되는 것까지 확인한 것들이다.

update courses set image_url = 'https://images.unsplash.com/photo-1575907789733-c3dda018bae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'
where id = 'haeundae-gijang-2days';

update courses set image_url = 'https://images.unsplash.com/photo-1672671187899-a10f547341f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'
where id = 'westbusan-2days';

update courses set image_url = 'https://images.unsplash.com/photo-1633839537302-3c195a4893be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'
where id = 'oryukdo-gwangalli-2days';

update courses set image_url = 'https://images.unsplash.com/photo-1704072939275-163c8d456685?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'
where id = 'seomyeon-gwangalli-2days';

update courses set image_url = 'https://images.unsplash.com/photo-1580793241553-e9f1cce181af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'
where id = 'seomyeon-centum-gwangalli-3days';
