# 0.3.7 검증 결과 · 발맞춘 골목 친구들

## 분석 및 범위

현재 콩이/까망/몽실은 이미 고등어태비/검은 고양이/포메라니안으로 리팩토링된 48×48 normal/blink Image입니다. 나비는 몸/귀/꼬리가 분리된 NabiView Container, 두부는 같은 48×48 Image입니다. atlas/외부 sprite sheet는 없습니다. 다섯 본체 모두 불투명 발 픽셀의 끝이 캔버스 y=47에 맞으며, origin은 본체 중심 (24,24), 표시 배율은 2.5입니다. 종류에 따라 높이/폭/무늬/꼬리 실루엣이 다르지만 발 끝은 같습니다. 별도 손님 그림자는 없었습니다.

이번에는 이미 요청에 맞는 캐릭터 그림을 다시 그리지 않고 픽셀 그대로 유지했습니다. 수정된 나비 꼬리/뿌리/pivot/tween도 동일합니다. CharacterArt의 공통 customerRender에 size=48, centre=24, footY=47, scale=2.5, seatedScaleY=2.42를 명시하고 기존 렌더 코드에서 참조합니다. 식사·감정·나비 분리 파츠의 좌표 호환을 위해 중심 origin을 유지하며 공통 발 오프셋 23px로 바닥 기준을 계산합니다.

소스 변경: src/game/CharacterArt.ts, src/game/CustomerVisit.ts, src/game/NabiView.ts, src/scenes/RestaurantScene.ts. 버전/문서 변경: package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.

## 배치 및 그림자

- 기존 좌표/템포 유지: 입장 (-65,743), 자리 앞 (224,729), 착석 (246,733). 재로드/스토리 복귀 위치는 CustomerVisit.seat 참조로 통일.
- 공통 바닥 기준은 guest.y + 23 * guest.scaleY. 자리 앞 786.5px, 착석 788.66px이며 기존 자리 깊이/앉는 연출을 유지합니다. 캐릭터별 임의 seatOffset은 필요하지 않았습니다.
- 작은 바닥 ellipse 1개를 손님 뒤에 추가. alpha=.28, 높이 9px, 폭 나비46/까망42/콩이52/두부58/몽실64px. 중심은 손님 x, y는 발 끝.
- CustomerVisit이 생성·소유하며 기존 tween onUpdate에서 이동/착석/서기/대기 그림자를 갱신합니다. 음식 반응 때 그림자는 바닥에 남습니다. 별도 Scene update loop/timer/이동·감정 시스템 없음.
- 퇴장/destroy/Scene shutdown에서 그림자 제거. 기존 애니메이션 및 tween/timer/effect cleanup 그대로 유지.
- 콩이 텍스트는 이전에 고등어태비로 정리되어 있으며 현재 삼색 표기는 나비에만 있습니다. 대사/스토리/캐릭터 ID/저장 데이터 변경 없음.
- 본체/도감 SVG는 같은 픽셀 데이터여서 일치합니다. 기존 도감 UI/일반 미발견 실루엣 유지. 대화·주문창에는 캐릭터 초상화가 없어 새 UI를 추가하지 않음.

## 검증

Headless Chromium 153: PC 마우스 720px, 모바일 터치 320/390px 에뮬레이션 기준. 실물 스마트폰 테스트는 하지 않았습니다.

- RestaurantScene에 5명과 공통 발 기준선을 비교 배치한 320/390px screenshot 검토. 무늬/눈/견종·체형 차이와 같은 발 위치/그림자 확인. 비교 UI는 테스트 브라우저에서만 생성, 제품 코드에 없음.
- 이전 CharacterArt와 다섯 캐릭터 normal/blink 픽셀 배열 및 나비 꼬리 그림/레이아웃 동일. 모든 본체 foot edge 47px 확인.
- 다섯 명 실제 방문을 각각 시작: 착석 시 공통 baseline 및 그림자 위치/1개 생성, 식사/보상, 퇴장 후 그림자 0개 검증.
- 입장/착석/서기/인사/퇴장 중 반복 좌표 샘플링: 그림자는 x 오차 0.1px 미만, 발 계산 y 오차 1.1px 미만으로 기존 움직임에 붙어 있음.
- 콩이/까망/몽실 v1 저장에서 친밀도24/방문4회 복원 → 기존 레시피 해금 팝업 → 착석/주문/식사/보상 → 기존 일반 이야기 → 퇴장/정산/다음 밤 → 새로고침 후 방문5회/storyStage1 유지 통과.
- 실제 첫 밤: 나비 첫 이야기 새로고침 복원, 주먹밥/어묵/우유 요리, 다섯 손님, 음식/보상/정산/다음 밤 통과.
- 나비 idle/눈/귀/꼬리와 stage1/6 퇴장, 두부 공통 대기/blink, 친밀도별 인사, 입장/착석 전 주문 차단, offscreen cleanup/다음 손님 공백, 모바일 모달 터치, Scene 종료 통과.
- NORMAL/GOOD/PERFECT 식사/보상 1회 지급, 식사 중 새로고침/cleanup, quiet 이야기 우선순위, 비/환경/날씨 전환 및 Scene 재시작 통과.
- npm run test:story: v1/v2 저장 호환, 기존 진행/커서/완료/중복 방지/손님 해금 통과.
- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있음.

SaveData/Customer ID/대사/스토리/요리/레시피/보상/날씨·환경 로직 변경 없음.

---

# 0.3.6 검증 결과 · 몸 뒤에 이어지는 꼬리

## 원인 및 최소 수정

기존 나비는 NabiView → bodyRoot → tail, bodyImage, ears 순서의 분리 Container였습니다. 꼬리 레이어는 이미 몸 뒤여서 depth 문제는 없었습니다. 그러나 꼬리 오프셋 (17,19), origin (.5,1), 8×24 텍스처였으며 몸통 오른쪽 끝 x=34와 꼬리 뿌리 x=39~44 사이가 떨어져 있었습니다. 넓은 아래 끝을 중심으로 최대 ±19°로 회전해 작은 화면에서 떨어진 손/앞발처럼 읽힐 수 있었습니다.

나비 body/귀/눈/얼굴/발은 그대로 유지하고 tail 파츠 및 연결 좌표만 수정했습니다. 소스 변경은 src/game/CharacterArt.ts, src/game/NabiView.ts, src/scenes/BootScene.ts 세 파일입니다. 버전/문서 변경은 package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md입니다.

## 꼬리 연결과 움직임

- 파츠 18×22, 실제 뿌리 pivot (3,13), origin (3/18,13/22).
- 48×48 본체 기준 anchor (32,38), Container 오프셋 (8,14). 뿌리가 오른쪽 엉덩이 안쪽에 겹치며 꼬리는 몸 뒤에서 곡선을 따라 옆으로 나왔다가 가늘게 올라갑니다.
- 뿌리는 주황, 굽은 부분 크림, 가는 끝은 검정. 기존 삼색 패턴 유지. 넓은 아래 끝을 흔드는 형태를 제거했습니다.
- tail/bodyImage는 같은 bodyRoot의 자식이라 몸의 호흡/식사/슬픔 tilt/걷기에 함께 움직입니다. 기존 body 뒤 순서 유지, 별도 depth/timer/감정 시스템 없음.
- nabiTailLayout에서 본체/도감 합성 오프셋, 실제 Image pivot/anchor, Boot 텍스처 크기를 공유합니다. 정적 portrait도 같은 연결부로 자동 반영합니다.
- 기본 idle ±3°, 단골 ±4°, 완료 후 ±5°, shy ±2°, happy/smile ±6°, PERFECT ±9°, sad ±0.3°. happy 왕복 편도 900ms, PERFECT 420ms, idle 1800ms, sad 3000ms.
- 걷기 ±2°/750ms, quiet 인사 ±0.5°, 친구 인사 ±6°/1000ms. 기존 반응 지속 시간/idle 복귀/스토리 우선순위/tween cleanup 유지.

## 브라우저·회귀 검증

Headless Chromium 153: PC 마우스 720px, 모바일 터치 320/390px 에뮬레이션. 실물 스마트폰 테스트는 하지 않았습니다.

- 실제 생성 body/tail 텍스처의 alpha mask로 -9°부터 +9°까지 1° 간격 검증. 모든 각도에서 뿌리/몸이 최소 25픽셀 겹쳤으며 회전 중 연결이 끊어지지 않음.
- 실제 tail Image의 anchor/origin, bodyRoot 내 몸 뒤 순서 검증. 나비 body/normal/blink 및 다른 4명 디자인 데이터 이전과 동일.
- idle/happy/PERFECT/sad/완료 후/walk/farewell 각 상태의 실제 tween 범위와 꼬리 tween 1개 유지 검증. 320px에서 각 상태 최소/최대 각도 screenshots 확인, 390px 실제 주문 화면 및 48/32px 본체/도감 이미지 확인.
- 20회 스토리 quiet → 종료 → PERFECT 전환에서 꼬리 tween 중첩 없음. cleanup 후 timer/tween/effect 모두 0, 브라우저 오류 없음.
- 첫 밤 실제 UI: 나비 이야기 새로고침 복원, 주먹밥/어묵/우유 요리, 음식 제공, 골드/친밀도, 다섯 손님, 영업 종료/다음 밤 통과.
- NORMAL/GOOD/PERFECT 식사와 보상 1회 지급/저장 복원, 나비 기존 하트/반짝임, quiet 스토리 우선순위, 비/날씨 전환/환경 idle, Scene 재시작 cleanup 통과.
- 입장/착석 전 주문 차단, 나비 stage 1/6 idle·퇴장, 친밀도별 인사, 화면 밖 cleanup/다음 손님 공백, 입장·퇴장 중 새로고침 및 모바일 모달 터치 통과.
- npm run test:story: v1/v2 저장 호환, 방문/밤/친밀도 조건, 대화 커서 저장/복원, 완료/중복 방지, 다른 손님 해금 통과.
- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있음.

SaveData, 고객 데이터/ID, 스토리/대화, 주문/요리/골드/친밀도/레시피/날씨/환경/방문 흐름 로직 변경 없음.

---

# 0.3.5 검증 결과 · 골목 친구들의 다섯 얼굴

## 기존 구조 및 최소 변경

콩이/까망/몽실은 모두 48×48 Graphics 생성 normal/blink 텍스처를 쓰는 Phaser Image입니다. 별도 atlas/외부 sprite sheet/분리된 귀·꼬리 프레임은 없었습니다. CustomerVisit이 공통 호흡/랜덤 blink/고개 갸웃·살피기/입장·착석·퇴장을 담당하며 CustomerMeal이 공통 식사를 담당합니다. 나비는 기존 NabiView의 분리된 body/귀/꼬리 Container입니다.

CharacterArt에 세 디자인과 타입 가드만 추가하고 Boot의 기존 텍스처 생성 분기에 연결했습니다. 모든 texture key, 48×48 크기, 중심 origin, 발 하단 47px을 유지합니다. 새 tail timer/행동 시스템은 만들지 않았습니다. 까망은 CustomerMeal의 기존 tween에서 들뜬 y 점프를 0으로, NORMAL 끄덕임을 0.5도로, GOOD/PERFECT 반짝임을 1개로만 줄였습니다. 시간·입력 잠금·보상·cleanup은 동일합니다. 몽실은 기존 공통 blink/고개 갸웃/작은 식사 반응을 재사용합니다.

소스 변경: src/game/CharacterArt.ts, src/scenes/BootScene.ts, src/data/customers.ts, src/game/CustomerMeal.ts. 버전/문서 변경: package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.

## 디자인 및 텍스트

- 콩이: 고등어태비 고양이, 회갈색/짙은 회색, 큰 M 이마와 굵은 몸 줄무늬, 세 링 꼬리, 조금 다부진 길냥이 자세. kong ID/성격/취향/스토리 유지.
- 까망: 차콜/거의 검정/푸른 회색 명도, 가는 황금 눈, 높게 선 귀, 긴 몸과 몸에 붙인 가는 꼬리. 밤 배경에서 얼굴/실루엣 구분.
- 몽실: 둥근 계단형 볼·목·가슴털, 밝은 황갈색/크림, 작은 귀와 얼굴, 눈 하이라이트/웃는 입, 등 뒤의 풍성한 꼬리. 두부의 단단한 링 꼬리와 구분.
- 나비/두부의 normal/blink 및 나비 body/blink/좌우 귀/꼬리 픽셀을 이전 CharacterArt와 비교해 완전히 동일함을 확인.
- 주인공/보리/달이/호두 normal/blink, 음식 5종, 하트/반짝임도 이전 텍스처와 PNG 픽셀 비교 동일.
- src/data, ui, systems에서 삼색/calico 검색: 콩이 종 표기 외 대사·스토리 충돌 없음. 현재 삼색 표기는 나비에만 남음.
- 기존 도감의 다섯 주요 portrait를 같은 CharacterArt 데이터로 자동 생성. 미발견 실루엣 유지. 대화/주문창에는 원래 캐릭터 초상화가 없으므로 새 UI를 만들지 않음.

## 브라우저 및 회귀 검증

Headless Chromium 153, PC 720px 마우스, 모바일 320/390px 터치 에뮬레이션 기준입니다. 실물 스마트폰 테스트는 하지 않았습니다.

- 다섯 캐릭터 96/48/32px 및 검정 실루엣 비교 화면 시각 검토. 고양이 몸/귀/꼬리와 강아지 체형/털/꼬리 차이 확인.
- 실제 RestaurantScene 밤 배경에 다섯 캐릭터 비교 배치, 320/390px에서 무늬/눈/털/꼬리 식별 확인. 도감 SVG 5개 정상 로드와 실루엣 일치.
- 실제 첫 밤 UI: 나비 이야기 새로고침 복원 → 주먹밥 PERFECT → 두부 어묵 PERFECT → 까망 어묵 NORMAL → 몽실 우유 → 콩이 주먹밥 → 정산/다음 밤 통과.
- 기존 나비/두부 입장·착석·대기·blink·귀·꼬리, 친밀도 0/10/25 인사, 나비 story 1/6 퇴장, 화면 밖 제거/공백/다음 손님, 입장·퇴장 중 새로고침, 모달 터치, Scene cleanup 통과.
- NORMAL/GOOD/PERFECT 식사, 먹는 동안 보상 지연, 중복 serve 차단, 골드/친밀도 1회 지급과 저장 복원, 나비 하트/품질 반응, quiet 스토리 우선순위 통과. 기존 테스트의 까망 반짝임 기대값만 새 반응 강도 1개로 맞춰 검증.
- 320px 실제 방문 UI: v1 저장에서 콩이/까망/몽실 친밀도 24·방문 4회 복원, 순차 착석/주문/식사/보상, 기존 5회 일반 이야기, 레시피 해금 팝업 터치, 퇴장/정산/다음 밤/새로고침 후 방문 5회·storyStage 1 유지 통과. 까망 PERFECT 반응에서 y=733 유지 및 반짝임 1개 확인.
- 기존 비/날씨 전환/환경 idle, timer/tween/effect 제한, Scene 재시작 cleanup, 브라우저 오류 없음 통과.
- npm run test:story: v1/v2 저장 호환, 방문/밤/친밀도 조건, 대화 커서, 완료/중복 방지, 다른 캐릭터 해금 통과.
- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있음.

SaveData, 캐릭터 ID, 스토리/대화 데이터, 요리/레시피/보상/날씨/방문 흐름 시스템은 변경하지 않았습니다.

---

# 0.3.4 검증 결과 · 삼색 무늬와 말린 꼬리

## 기존 구조 및 수정 범위

48×48 Phaser Graphics 생성 텍스처였으며 atlas/외부 sprite sheet는 없었습니다. 나비는 body/blink + 분리된 11×15 귀/8×24 꼬리를 갖는 NabiView Container, 두부는 normal/blink Image입니다. 기존 두부 귀는 늘어진 사각형, 나비는 치즈고양이 표기/단색 외형이었습니다.

CharacterArt.ts 정수 사각형 데이터만 새로 분리했습니다. Phaser 텍스처와 기존 도감 이미지용 SVG가 같은 데이터를 사용합니다. 나비 표기/색만 요청에 맞춰 삼색으로 정리했습니다. 두부는 말린 꼬리, 선 귀, 크림 주둥이, 다부진 몸입니다. 일반/blink 눈 위치, 48×48 크기, 모든 texture key 및 나비 pivot 유지. 나비 오른쪽 귀는 검은색 전용 텍스처를 사용하며 timer/tween 코드는 변경하지 않습니다.

소스 변경: src/game/CharacterArt.ts(신규), src/game/NabiView.ts(귀 텍스처 참조 한 곳), src/scenes/BootScene.ts, src/scenes/CustomerBookScene.ts, src/data/customers.ts(나비 종/색), src/style.css(두 도감 이미지 전용 규칙). 문서/버전: README.md, CHANGELOG.md, VERIFICATION.md, package.json, package-lock.json.

## 확인 결과

- Headless Chromium 153: PC 720px 마우스, 320/390px 모바일 터치 에뮬레이션.
- 48px 및 32px 축소 디자인과 실제 모바일 게임/도감 화면 시각 확인. 삼색 패치/긴 꼬리, 두부 삼각 귀/말린 꼬리/크림 주둥이 구분. 두 도감 SVG 정상 로드, 미발견 실루엣 규칙 유지. 대화창은 기존에 초상화가 없으므로 새 UI를 추가하지 않음.
- 첫 밤 실제 UI: 나비 첫 이야기 중 새로고침/복원 → 참치 주먹밥 PERFECT → 두부 어묵 PERFECT → 까망 어묵 NORMAL → 몽실 우유 → 콩이 주먹밥 → 정산/다음 밤 통과.
- 나비 idle/눈/귀 및 두부 공통 blink/대기, 착석 전 주문 차단, 친밀도 0/10/25 퇴장, 나비 story stage 1/6 퇴장, 화면 밖 제거/다음 손님 공백 통과.
- NORMAL/GOOD/PERFECT 식사 반응과 나비 친밀도 하트, 먹는 동안 보상 지연/1회 지급, 중복 serve 차단/저장 복원 통과.
- 퇴장/입장 중 새로고침과 중복 보상 방지, 실제 이야기 결말 저장, 미완료 이야기 퇴장 차단, 완료 후 뒤돌아보기, 4회 Scene 재시작 및 timer/tween cleanup 통과.
- npm run test:story: 기존 v1/v2 저장 호환, 방문/밤/친밀도 조건, 대화 커서 저장, 완료/중복 방지, 다른 손님 해금 통과.
- 이전 BootScene과 PNG 픽셀 비교: 주인공/다른 손님 6명 및 blink, 음식 5종, 하트/반짝임 동일.
- 기존 SaveData/스토리 데이터/요리/보상/날씨/환경/방문 로직 파일은 변경 없음. 모바일 실기기 측정은 하지 않았으며 터치/화면 검증은 에뮬레이션 기준.
- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있음.

---

# 0.3.3 검증 결과 · 작은 발걸음, 또 만나요

## 구조와 범위

기존 손님은 왼쪽 화면 밖에서 좌석까지 하나의 tween으로 이동하고, 식사/후반 대화 후 오른쪽으로 움직인 즉시 다음 손님을 생성했습니다. 나비는 NabiView Container, 다른 손님은 Image였습니다. 식사는 CustomerMeal, 환경은 RestaurantEnvironment/WeatherView, 실제 지급은 ProgressionManager로 이미 분리돼 있었습니다.

현재 RestaurantScene.phase 하나를 그대로 사용하며 seating/waiting/standing/farewell/gap을 추가했습니다. CustomerVisit은 렌더링 이동/공통 대기만 소유합니다. Customer/SaveData 상태나 queue/보상/스토리 시스템을 새로 만들지 않았습니다.

소스 수정: src/game/CustomerVisit.ts(신규), src/game/NabiView.ts, src/scenes/RestaurantScene.ts. 부가 수정: package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.

## 입장과 대기

- 골목(-65,743) → 자리 앞(224,729) 1.15초, 0.27초 멈춤, 착석(246,733) 0.26초, 주문 전 0.24초.
- 이동 x/y와 별개 scaleY 2.50↔2.46 발걸음, 착석 scaleY 2.42. 이동 오브젝트를 재생성하지 않습니다.
- 공통 손님: y 1px 호흡, 랜덤 blink 2.5~5초, 랜덤 행동 4~8초. 강아지 주방 방향 갸웃, 고양이 테이블 살피기. 행동 하나가 끝난 뒤 다음을 예약합니다.
- 나비: 기존 눈/귀/꼬리 timer/tween 그대로 재사용, 추가 대기 타이머 없음. 이동은 idle 대신 약한 꼬리, 착석 후 기존 idle.
- 식사/스토리 중 공통 대기 중단, 기존 연출 우선. 입장/착석 전 cook 없음, 잘못된 order/nextGuest 호출 무시, 버튼 중복 조리/진행 차단.

## 퇴장

- 이야기 완료 → 0.16초 pause → 0.26초 일어나기 → 관계별 인사 → 골목 이동 → x=-65에서 cleanup/destroy → 0.4초 gap → 다음 손님.
- 기존 구간 0~9 짧은 끄덕임, 10~24 주방 인사, 25+ 반짝임 1개. quiet 직후 반짝임/들뜬 반응 없음.
- 나비 COMPLETE: 몇 걸음 나가 x=160에서 0.35초 멈춤, 작은 뒤돌아보기와 편안한 꼬리 후 퇴장. 두 번째 반짝임이나 대사 없음.
- 미완료 characterStory.pending가 있으면 depart를 막습니다. 후반 대화/완료 stage/저장은 기존 CharacterStoryManager 그대로입니다.
- pauseWaiting/cleanup에서 소유 timer/tween/effect 정리, destroy/shutdown listener 해제. 나비 이동 전 기존 활동 정리, 최종 제거 시 기존 NabiView.cleanup. gap timer는 Scene shutdown에서 취소합니다.

## 실제 브라우저 검증

Headless Chromium 153, PC 마우스 720px/모바일 터치 320·390px:

- 초기 등장 → seating/waiting 기록 → 착석 완료 뒤 첫 나비 스토리/주문. 입장 중 order/nextGuest 연타 무시, 좌석 y=733, 착석 후 idle 시작.
- 두부 친밀도 0/10/25, 나비 0/COMPLETE 35: 랜덤 대기 관측, 식사와 15G 1회 지급, standing/farewell/leaving/gap 순서, 낮은 친밀도 반짝임 없음/25+ 1개.
- 나비 COMPLETE 퇴장 x=160에서 0.35초 멈춤, x<-55까지 실제 이동, 화면 밖 제거. gap 0.4초 내 다음 손님 생성 안 됨. 이후 다음 손님 주문 정상.
- 제거 뒤 CustomerVisit timer/tween/effect 0, 나비 소유 timer/tween 0. 중복 depart/nextGuest 무시, 골드 변화 없음.
- 입장 중 새로고침: 기존 주문 재진입. 퇴장 중 새로고침: 이미 지급한 12G/방문 1회 유지하고 다음 손님 재진입. 도감 열기/닫기 터치 정상.
- 이동 중 Scene.stop 후 지연 주문/다음 손님 없음, 손님/환경 소유 리소스 0. 4회 Scene.restart 후 이전 리소스 0.
- 실제 미완료 나비 결말 after 복원: sad 유지, depart/nextGuest 강제 호출 무시, UI 대화를 끝내면 stage 6 저장/특별 퇴장/정산/다음 밤, 골드 200 유지.
- 실제 첫 밤 전체: intro 대화/새로고침 → 참치 주먹밥 → 두부 어묵 PERFECT → 까망 어묵 NORMAL → 몽실 우유 → 콩이 주먹밥 → 정산 → 다음 밤 통과.
- 모바일 입장/착석/일어나기/인사/퇴장/gap 364프레임 rAF 관측 약 59.6fps, 50ms 초과 프레임 0. CustomerVisit 동시 소유 timer 최대 3(착석 후 잠깐), tween 최대 2. 실제 저사양 휴대폰 FPS는 미검증.
- 런타임 오류 없음.

## 보호된 기능과 빌드

- data/, systems/, types/, CookingScene/RiceballCooking/OdenCooking, CustomerMeal, RestaurantEnvironment, WeatherView, CSS는 이전 버전과 바이트 단위로 동일합니다.
- SaveData/LocalStorage 키 및 버전 변경 없음. 이동 중 상태는 저장하지 않습니다.
- npm run test:story 통과: 기존 저장 호환/친밀도·방문·밤 조건/문장 복원/결말/중복 방지/다른 손님 이야기.
- npm run build 통과. 기존 Phaser 번들 크기 경고는 유지됩니다.

---

# 0.3.2 검증 결과 · 보글보글, 따뜻한 한입

## 기존 구조와 수정

RestaurantScene의 단일 Graphics 배경/등불 Rectangle/반복 김 tween에서 천막과 간판만 분리했습니다. 기존 WeatherView는 58개 rain/34개 snow 도형을 update로 이동하며 지붕 안을 숨깁니다. 이 시스템은 그대로 사용하고 RestaurantEnvironment의 짧은 TimerEvent/Tween 효과만 추가했습니다.

기존 serve는 ProgressionManager.serve 직후 나비 meal/보상 UI를 표시했습니다. 현재 serve는 입력을 잠그고 CustomerMeal을 시작하며 2.35초 뒤 기존 ProgressionManager.serve를 호출합니다. 이후 대사/스토리/퇴장/정산 흐름은 유지합니다. NabiView의 음식 만족과 친밀도 표시를 taste/affinity로 분리해 보상 전에 하트가 뜨지 않도록 했습니다.

수정: src/game/RestaurantEnvironment.ts(신규), src/game/CustomerMeal.ts(신규), src/game/NabiView.ts, src/scenes/BootScene.ts, src/scenes/RestaurantScene.ts, package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.

## 브라우저 검증

Headless Chromium 153, PC 720px 마우스 및 모바일 320/390px 터치 에뮬레이션:

- 나비 NORMAL/GOOD/PERFECT, 두부 PERFECT, 까망 GOOD: 음식 놓기/축소/단계적 반응. 먹는 중 골드/친밀도 미변경, 반응 후 10/12/15G 및 1/2/3 친밀도 정확히 1회 지급.
- 나비 맛보기 반짝임 0/2/3개. 실제 지급 후 하트 1/1/2개. 음식·접시·김 및 먹기 timer/tween 모두 종료 후 0.
- 먹는 중 메뉴 disabled, 중복 serve/nextGuest 무시. 지급 후 재호출도 무시. 메뉴 복구.
- 먹는 중 새로고침: 미지급 주문 재진입. 중간 shutdown: 지연 보상 취소, 각 객체 소유 timer/tween/effect 0.
- 나비 STORY_5: PERFECT도 들뜬 반응/하트 없음, 보상 유지. 실제 quiet 대화와 재로딩 뒤 sad 상태/골드 유지.
- 나비 기존 랜덤 blink/귀/꼬리/호흡 유지. 30번 날씨 변경 뒤 환경 timer 최대 4개, tween/effect 상한 유지. clear 전환 시 rain 효과 제거. Scene 재시작 후 이전 리소스 0.
- 전체 첫 밤 실제 조작: 나비 intro 대화/새로고침 → 주먹밥 → 두부 어묵 PERFECT → 까망 어묵 NORMAL → 몽실 우유 → 콩이 주먹밥 → 정산 → 다음 밤. 요리 코드는 변경하지 않았습니다.
- 새로고침 뒤 골드/방문/날짜 유지. 런타임 오류 없음.
- 390px 비 날씨 8.5초 rAF 관측 약 60fps, 50ms 초과 프레임 0. 이는 데스크톱 소프트웨어 렌더러의 모바일 에뮬레이션 수치이며 실제 저사양 휴대폰 FPS를 보장하지 않습니다.

## 빌드 및 보호된 기능

- npm run test:story 통과: v1/v2 호환, 방문/친밀도/밤 조건, 대화 cursor, 분할 결말, 이벤트 재실행 방지, 기존 다른 손님 이야기.
- npm run build 통과: TypeScript/Vite 오류 없음. 기존 Phaser 번들 500kB 경고는 남아 있습니다.
- data/, systems/, types/, style.css 및 요리 Scene/WeatherView/CustomerBookScene은 이전 버전과 바이트 단위로 동일합니다. SaveData/LocalStorage 키/보상 계산식/스토리 내용/레시피 해금/날씨 결정 변경 없음.
- 환경 최대 12개 및 공통 식사 최대 7개, 새 update loop/emitter/pooling 없음. Scene 종료 시 timer/tween/object와 pagehide listener 정리.

---

# 0.3.1 검증 결과 · 살랑살랑 나비

## 원래 렌더링/애니메이션 구조

- BootScene의 Graphics로 생성하는 48×48 이미지, 기본/눈 감음 두 텍스처. atlas/sprite sheet나 프레임 기반 애니메이션은 없었습니다.
- RestaurantScene의 Image 하나, 전체 y tween과 공통 3.5초 blink timer. 귀/꼬리는 분리하지 않았습니다.
- 기존 나비 StoryLine의 normal/shy/quiet/smile에 따라 전체 이미지 각도/크기/위치를 바꾸었습니다.
- 음식 제공 후 ProgressionManager.serve가 실제 골드/친밀도/방문/스토리/레시피를 저장하고, RestaurantScene이 반응을 표시했습니다.
- 기존 친밀도 표현은 떠오르는 하트 텍스트+tween. 새 particle 시스템을 도입하지 않았습니다.

## 수정 범위

- src/game/NabiView.ts 추가: 나비만 몸/귀/꼬리 Container, idle/눈/귀/음식 반응/감정 우선순위/도트 이펙트/정리.
- src/scenes/BootScene.ts: 기존 나비 도트를 재사용하는 몸/눈 감음/귀/꼬리/하트/반짝임 텍스처. 다른 캐릭터 기존 텍스처 유지.
- src/scenes/RestaurantScene.ts: 나비 생성/착석/스토리 감정/실제 서빙 결과/퇴장 연결. 다른 손님 Image와 기존 연출은 유지.
- package.json/package-lock.json 버전 0.3.1, README.md/CHANGELOG.md/VERIFICATION.md 갱신.
- 0.3.0 전체 src와 바이트 비교: 기존 변경 파일은 BootScene/RestaurantScene 두 개뿐, NabiView만 추가. 기존 스토리 데이터/진행/대화 UI/요리/보상/날씨/레시피/저장 타입과 로직/CSS/글꼴은 동일합니다.

## 동작

- 기본 반복 tween 2개: 몸의 미세 호흡, 꼬리. 눈 2.5~5초, 귀 4~8초 랜덤 타이머.
- 초반 꼬리 ±5도, 친밀도 10 또는 스토리 2단계 이후 ±8도, 완료 후 ±12도. 음식 happy ±12도/650ms, veryHappy ±19도/260ms. quiet ±0.6도/3000ms.
- NORMAL 작은 고개 움직임, GOOD/취향 맞춤 꼬리+반짝임 2개, PERFECT 약 2px 들림+눈 감음+반짝임 3개.
- 실제 친밀도 증가 시 도트 하트 1~2개. 하트 1~1.1초, 반짝임 0.65~0.85초 후 제거. 동시 이펙트 최대 5개.
- storyEmotion을 재사용. shy 귀 쫑긋/작은 들림, quiet 낮춘 귀/작은 고개 숙임/느린 몸/거의 멈춘 꼬리/이펙트 없음, smile 눈 감음/부드러운 꼬리/반짝임 1개.
- 스토리 > 음식 > 친밀도 > idle. 음식/친밀도 반응은 최대 1.8초 후 idle, 스토리 감정은 대화 종료까지 유지.
- 루트 Container는 입장/퇴장만 이동, 내부 bodyRoot는 감정/호흡만 이동하여 tween 충돌 방지.
- owned TimerEvent/Tween/effect를 퇴장 시작, destroy, Scene shutdown에서 제거. 동일 부위 tween 교체, shutdown listener 해제. 전용 update loop나 particle emitter 없음.

## 실제 브라우저 회귀 테스트

Headless Chromium 153, 실제 마우스와 터치 이벤트.

- PC: 첫 밤/나비 등장/첫 대화와 새로고침 복원/idle/꼬리 변화/랜덤 눈 깜빡임과 귀 움직임 확인.
- PC: 주먹밥 PERFECT → 매우 기쁨/감은 눈/하트 2/반짝임 3, 기존 골드 +15. 1.9초 후 idle/이펙트 0/반복 tween 2개로 복귀.
- 나비 퇴장 후 timer 0/tween 0/effect 0/active false, 다음 두부는 기존 Image. 기존 어묵 NORMAL 제공과 보상 확인.
- 모바일 390px: 실제 주먹밥 GOOD → happy/반짝임 2/하트 1/기존 골드 +12 → 정산/다음 밤/새로고침 저장 복원.
- 모바일 320px: 실제 주먹밥 NORMAL → 작은 고개 반응/반짝임 없음/하트 1/기존 골드 +10 → 정산/다음 밤/저장 복원.
- 기존 NABI_STORY_5 식사 후 대화 저장을 로드: sad, 꼬리 범위 0.6도, 하트/반짝임 0. PERFECT 반응을 호출해도 스토리 감정 유지. 새로고침 후 같은 감정과 대화 복원, 골드 중복 없음.
- 마지막 이벤트의 기존 smile 대사: 감은 눈/반짝임 1. 실제 완료 버튼으로 stage 6 저장, endStory에 stage 6 전달 확인. 다음 밤 나비 일반 주문에서 편안한 ±12도 idle, 이벤트 반복 없음.
- 반응 40회 연속 호출: timer≤5/tween≤9/effect=5로 제한. Scene stop 이후 모든 owned count 0. 런타임 오류 없음.
- 친밀도 증가 0인 반응: 하트 없음. 20회 생성/반응/정리/destroy: shutdown listener 수 증가 없음, 골드 변화 없음.
- 첫 밤 5명 전체 회귀: 나비 주먹밥 → 두부 어묵 → 까망 어묵 → 몽실 우유 → 콩이 주먹밥 → 정산 → 다음 밤. 기존 대화/요리/보상 흐름 정상.
- PC PERFECT와 모바일 quiet 스크린샷 시각 검토. 새 입력/hover 의존 추가 없음.
- npm run test:story 통과: 기존 v1/v2 저장, 진행 조건, 문장 복원, 완료/중복 방지, 다른 캐릭터 해금 유지.

## 최종 빌드/단일 HTML

npm run build 성공: TypeScript strict와 Vite production build 통과. 기존 Phaser 번들 크기 경고만 있습니다.

최종 file:// 단일 HTML 터치 실행: 첫 인사 → 주먹밥 → 서빙 → 두부 어묵 → 서빙 → 다음 손님 → 나비 도감 1/6 확인. 포함 글꼴 로드, 외부 HTTP/HTTPS 요청 0건, JavaScript 오류 0건.

물리 휴대폰의 실측 FPS/저사양 성능 테스트는 수행하지 않았습니다. 이펙트 수와 기본 tween/timer를 작게 제한하는 구조 및 모바일 브라우저 에뮬레이션을 검증했습니다.
