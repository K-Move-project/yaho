-- 행사 상세페이지에서 원본 출처(공식 페이지)로 이동할 수 있게 source_url 컬럼을 추가한다.
-- Visit Busan에서 가져온 21건은 실제 원문 페이지 URL이 있으므로 채워 넣고,
-- 기존 TourAPI 수집분은 원문 페이지가 따로 없어 null로 둔다.

alter table festivals
  add column if not exists source_url text;

update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5348' where id = 'visitbusan-5348';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5392' where id = 'visitbusan-5392';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5486' where id = 'visitbusan-5486';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5524' where id = 'visitbusan-5524';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5767' where id = 'visitbusan-5767';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5878' where id = 'visitbusan-5878';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5907' where id = 'visitbusan-5907';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=5937' where id = 'visitbusan-5937';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6037' where id = 'visitbusan-6037';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6051' where id = 'visitbusan-6051';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6060' where id = 'visitbusan-6060';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6067' where id = 'visitbusan-6067';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6068' where id = 'visitbusan-6068';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6074' where id = 'visitbusan-6074';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6083' where id = 'visitbusan-6083';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6090' where id = 'visitbusan-6090';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6111' where id = 'visitbusan-6111';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6148' where id = 'visitbusan-6148';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6167' where id = 'visitbusan-6167';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6168' where id = 'visitbusan-6168';
update festivals set source_url = 'https://www.visitbusan.net/schedule/view.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&dataSid=6227' where id = 'visitbusan-6227';
