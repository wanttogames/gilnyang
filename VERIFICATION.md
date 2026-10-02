# 0.4.0 검증 결과 · 오늘 밤의 골목

## 기존 구조 / 변경 범위

기존 CustomerManager는 첫 밤 5명의 고정 순서와 이후 기존 손님만 포함한 5칸 큐를 사용했습니다. RestaurantScene의 current/guest/currentRecipe/phase는 한 손님을 가정했고 CustomerVisit 좌석은 (246,733), CustomerMeal 음식 위치는 (326,778)이었습니다. 기존 날씨/스토리 데이터 및 요리 클래스는 유지합니다.

일반 손님 7종은 ambientCustomers 데이터와 코드 네이티브 48px 픽셀에 정의합니다. 기존 주요 캐릭터 ID/픽셀/파츠/스토리/친밀도 진행은 변경하지 않았습니다. 일반 손님의 진행 객체는 Scene 내 임시값이며 SaveData.customers에 추가하지 않습니다. 공통 quality별 골드만 지급합니다.

밤 상황 ordinary/shower/cold는 기존 clear/rain/snow를 사용합니다. shower는 rain일 때만 선정하며 방문 수 5→6, 일반 손님 주문의 어묵/라면 가중치 ×3입니다. cold는 눈 또는 일부 맑은 밤에 선정하며 같은 메뉴 가중치 ×4입니다. 기존 단골의 메뉴/특별 주문은 유지합니다. cold/rain 일반 대사를 추가했습니다.

활성 손님 배열에는 customer/guest/visit/seat/state/recipe가 각각 있습니다. 좌석 A (246,733), B (526,733), 입장 300ms 시차. 큐 내 최대 두 명을 한 방문 그룹으로 묶고 두 주문 중 하나를 고릅니다. 실제 조리 순서에 맞춰 저장 큐를 바꿉니다. 첫 손님이 퇴장한 뒤 남은 손님은 원래 좌석에서 주문/식사를 이어갑니다. 그룹이 비어야 다음 방문이나 정산으로 넘어갑니다. 최대 2명이며 빈 좌석을 실시간 계속 보충하지 않습니다.

스토리 예약 가능성은 진행 객체의 복사본으로 조회합니다. 조건 충족 스토리 하나는 매 밤 우선 배치하고 최근 3명에 있으면 같은 밤 안에서 짧게 순서를 미룹니다. 다른 예약 가능한 스토리는 랜덤 큐에서 제외합니다. 실제 도착 시 예약하며 모든 주요 스토리와 음식 보너스로 legacy 대사가 해금될 수 있는 방문은 단독 처리합니다. 한 방문/한 밤 이벤트 중복 제한과 pending 커서는 기존 Manager를 사용합니다.

## 자동 검증

- npm run test:story: 나비/두부/까망 6단계 조건, 비 fallback, 레시피 gate, 저장 커서, split before/after, 중복 방지, 기존 v1/v2 데이터 보존 통과.
- npm run test:variety: 고정 PRNG 5,000밤/25,000슬롯에서 일반 62.8%, 동행 그룹 15.9% (후보 검사 확률 20%). 최근 3명 회피, 주요 단골 보장, 이야기 우선/단독 및 legacy 보너스 경계, 상황 주문 가중치, 일반 손님 친밀도 미저장, v1/v2 및 두 자리 큐 복원 통과.
- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 안내만 발생.

## 실제 브라우저 실행 검증

Playwright + Chromium, PC 1200×900 마우스 및 모바일 320×740/390×844 터치 에뮬레이션으로 확인했습니다.

- PC 새 저장: 영업 시작, 밤 소개, 나비 첫 이야기, 실제 주먹밥/어묵/우유 조리, 5명 제공, 정산, 다음 밤 통과.
- 두 자리: 일반+일반, 두부+일반, 나비+콩이, 까망+일반 및 두부+까망의 완료 후 일반 방문. 각각 착석 완료 후 주문, 원하는 순서 선택, 다른 손님 대기, 첫 손님 퇴장, 남은 좌석 유지, 두 번째 주문/식사/퇴장 통과.
- NORMAL/GOOD/PERFECT 공통 반응과 골드 1회, 기존 주요 친밀도, 일반 손님 친밀도 미지급 확인. 연타 serve 재호출에서 추가 지급 없음.
- 일반 손님 7종 정상 이미지/주문/식사/퇴장, 제거 뒤 그림자 0, 진행 데이터 미추가 확인.
- 첫 조리에서 B를 선택한 뒤 새로고침: 실제 처리 순서 복원 및 아직 미지급인 골드 유지. 첫 제공 후 새로고침: 남은 주문만 이어지고 지급 골드 유지.
- 나비 이야기 방문은 잘못 저장된 동행 표시가 있어도 단독 처리. 나비/두부/까망 저장된 식후 Story Event 재개, 대화 뒤 다음 일반 손님 진입, 기존 골드 추가 지급 없음. 콩이/몽실 기존 식사/퇴장 정상.
- rain/shower 및 snow/cold 기존 날씨/환경 연출 정상. 큰 주문 버튼은 320px에서 폭/높이 ≥44px, 패널/메뉴 겹침 없음. 두 좌석은 x=246/526, 기존 idle 1px 범위 안에서 같은 발 기준선을 유지합니다.
- 두부/까망 퇴장 후 View와 Visit 소유 timer/tween 모두 0, guest.active=false. 식사 도중 실제 Scene.restart에서도 이전 객체/타이머/tween 정리, 보상 미지급 상태와 두 주문 복원, 페이지 오류 없음.
- 주요 CharacterArt/NabiView/DubuView/KkamangView, 스토리 데이터/Manager, 요리 클래스, 레시피 정의, 날씨/환경 소스는 수정하지 않았습니다.

## 성능 및 검증 한계

390px 비 오는 장면의 같은 소프트웨어 Chromium에서 rAF 빈도는 단일 손님 47.4/50.3fps, 두 손님 47.8/46.1fps였습니다. 별도 첫 동행 표본은 37.4fps였으므로 이 수치를 실기기 성능 보장으로 해석할 수 없습니다. 공통 환경 객체 제한을 유지하고 불필요한 새 update loop/파티클 프레임워크를 추가하지 않았습니다. 물리 모바일 기기와 Safari는 검사하지 않았습니다. 영업 시간은 기존 5명 유지(소나기만 6명)로 제한했고 실제 사용자 4~7분 감각은 추가 플레이 피드백으로 조정할 항목입니다.

---

# 0.3.9 검증 결과 · 까망의 아직은

## 기존 구조 및 범위

까망 ID kkamang, 검은 고양이 디자인, 좋아하는 음식 ramen/oden, 기존 국물 취향은 유지합니다. 기존에는 48×48 normal/blink Image와 공통 CustomerVisit/CustomerMeal, legacy storyStage 3단계 대사를 사용했습니다. 비 오는 밤의 큐 가중치는 기존 그대로 4(다른 손님 1)입니다. 라면은 기존 3회 완료 방문·친밀도 5 조건으로 해금됩니다.

이번에는 기존 나비/두부의 CharacterStoryManager, StoryDialogue, CustomerProgress.characterStory, SaveManager.restore, 도감 표시를 재사용해 까망 6개 이벤트를 추가했습니다. 새로운 메인 미스터리 정답, 캐릭터 간 사건, 목걸이/사진/단서/인벤토리 시스템은 없습니다. 나비/두부 기존 콘텐츠 및 애니메이션 소스는 그대로입니다.

## 이벤트 조건

이번 방문 번호는 완료된 visitCount + 1입니다. 이전 이벤트 완료, 아래 최소 방문·친밀도, 이전 이벤트 이후 방문 간격, 이전 이벤트와 다른 밤을 모두 만족해야 합니다. 까망 이벤트에는 기존 ramen 레시피 해금도 필요합니다. 한 방문에 주요 이벤트 하나만 예약하며 pending 대화 커서를 저장합니다.

| 이벤트 | 최소 방문 | 최소 친밀도 | 이전 이벤트 이후 방문 | 위치 | 추가 조건 |
|---|---:|---:|---:|---|---|
| 1 비 오는 밤의 손님 | 4 | 5 | 0 | 주문 전 | 비 우선, 비 없으면 7번째 방문부터 |
| 2 의자가 바뀌었네 | 6 | 8 | 2 | 주문 전 | 의자 시선/침묵 |
| 3 냄비 | 8 | 12 | 2 | 주문 전 | 냄비 시선/기존 국물 취향 공개 |
| 4 계란 두 개 | 10 | 16 | 2 | 주문 전 + 식사 후 | two-eggs 제공 표현 |
| 5 예전보다 조용해졌네 | 13 | 22 | 3 | 주문 전 | 비 우선, 조건 충족 후 2회 더 방문하면 다른 날씨도 가능 |
| 6 아직은 | 16 | 28 | 3 | 식사 후 | 완료, 이후 일반 방문 유지 |

비 우선 fallback 기준은 max(minVisits, lastEventVisit + visitsSincePrevious) + fallbackVisits입니다. 따라서 오래된 높은 방문/친밀도 저장도 이전 이벤트 이후 간격을 지키며 진행합니다. 별도의 비 카운터/저장 필드를 추가하지 않았습니다. 이미 예약된 pending 이벤트는 재로드 때 날씨를 다시 검사해 취소하지 않습니다.

## 비주얼 및 조리 연결

- KkamangView Container: 원래 48×48 도트를 body/왼쪽 귀/오른쪽 귀/tail-base/tail-tip로 분리. normal/blink의 합성 결과와 도감 이미지는 이전 픽셀과 같습니다. 원래 발 y=47, 중심 origin, 배율 2.5, 좌석/그림자 기준을 유지합니다.
- 기본 idle: 몸 통통 움직임 없음. 꼬리 끝 ±2°/2.3초, blink 3.5~6초, 6~10초에 작은 한쪽 귀 또는 시선 하나. 조용한 방문에는 꼬리/귀 행동이 멈추고 blink 5~8초입니다.
- 입장 1.3초(조용한 방문 1.45초), 자리 앞 0.36초 멈춤. 작은 보행 scale 변화 .02, 비에는 한쪽 귀 털기. 기존 착석/입력 잠금/그림자 유지.
- 스토리의 gaze(chair/pot/street)와 기존 emotion(normal/shy/quiet/smile)을 사용합니다. quiet는 꼬리 정지, shy는 꼬리 끝 짧게 두 번, smile은 잠깐 눈 감기. 스토리 중 랜덤 idle를 실행하지 않습니다.
- 계란 두 개: 기존 ramen 레시피/재료/미니게임/추가 재료/품질/보상 그대로. Story Visit의 주문 안내와 제공 텍스처 meal-ramen-two-eggs만 다릅니다. 식사 후 조용히 눈을 감고 꼬리가 멈추며 반짝임은 없습니다.
- 일반 NORMAL은 기존 한입 뒤 별도 품질 동작 없음. GOOD은 잠깐 눈 감기/꼬리 끝 한 번, PERFECT는 기존 0.25초 정적 뒤 눈/한쪽 귀/전체 꼬리 1° 한 번. GOOD/PERFECT 반짝임 최대 1개, 큰 점프·하트 없음.
- 낮은 친밀도는 조용히 퇴장, 친밀도 10 이상은 주인공을 짧게 바라봄. 스토리 완료 시 몇 걸음 뒤 0.52초 멈춤/짧은 뒤돌아보기/꼬리 끝 한 번 후 퇴장합니다.
- 상태 변경과 퇴장/Scene shutdown/destroy에 소유 timer/tween 정리. 이미 제거된 파츠에는 종료 시 표정 복원을 하지 않습니다. 별도 update loop/복잡한 particle/pooling은 없습니다.

## 저장 호환

SaveData 버전 2, 저장 키, 캐릭터 ID는 동일합니다. 기존 v1/v2 저장을 계속 읽고 까망 characterStory 누락 시 stage=0을 적용합니다. 골드/날짜/날씨/레시피/업그레이드/친밀도/visitCount/legacy storyStage/나비·두부 진행은 보존합니다. 기존 legacy 기록은 새 드라마 단계로 변환하지 않으며, 새 아크는 순서대로 시작합니다.

## 검증

- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있습니다.
- npm run test:story: 세 캐릭터의 기존 저장 마이그레이션, 방문/밤/친밀도 게이트, 라면 잠금, 비 우선/fallback, pending cursor 복원, 계란 두 개 split 이벤트, 순서대로 6단계, 한 방문 하나/중복 방지, 완료 후 정상 상태, legacy 기록 보존 통과.
- 픽셀 검사: 다섯 주요 손님의 normal/blink, 나비 꼬리 및 pivot 데이터 유지. 까망 분리 파츠 합성이 기존 normal/blink 픽셀과 일치.
- 소스 비교: 나비/두부 스토리·완료 후 일반 대사, NabiView/DubuView, 요리 미니게임·레시피·보상·SaveManager/SaveData·고객 큐/날씨·환경 소스 동일.
- 실제 RestaurantScene: 까망 이벤트 1~6, 일반 방문, 비 등장, 라면 미해금 시 어묵 유지/스토리 보류, 맑음 fallback, 이벤트 순서/완료 후 일반 방문 확인.
- 이벤트 2 주문 전, 이벤트 4 주문 전/식사 후 새로고침 시 cursor와 이미 지급한 보상 유지. 모바일 실제 라면 조리 버튼으로 계란 두 개 주문→제공 텍스처→눈 감기/무반짝임→후반 대화 확인.
- 골드/친밀도/visitCount 1회 지급, 중복 serve/next 차단, 퇴장 완료 후 다음 손님, 퇴장/Scene 종료 timer/tween 0, 도감 6개 이야기/완료 제목 확인.
- 나비/두부/까망 각각 NORMAL/GOOD/PERFECT, 보상과 Scene 종료 cleanup 확인. 나비 split 완료, 두부 단추 이벤트/heldItem, 콩이·몽실 legacy 대화 유지 확인.
- 첫 밤 실제 UI 조작: 주먹밥/어묵/우유, 기존 손님 5명, 나비/두부 첫 이야기, 까망 해금 전 일반 방문, 정산/다음 밤 통과.
- 320/390px 터치 에뮬레이션: 캐릭터/특별 음식/도감 표시, 꼬리 끝 움직임/blink, 바닥/그림자 1개, 착석 전 주문 차단, 낮은/중간/완료 퇴장 차이 확인. 완료 시 뒤돌아보기, 이전 손님 퇴장 전 다음 손님 생성 없음.
- 같은 단일 브라우저·320px·비 오는 장면의 소프트웨어 렌더링 비교: 변경 전 47.9fps, 변경 후 48.6fps(각 5초). 이 환경에서 뚜렷한 추가 저하는 관찰되지 않았습니다. 실물 모바일/저사양 기기 성능은 미측정입니다.
- 브라우저 검증 최종 통과 케이스에서 runtime 오류 없음.

수정 파일: src/data/characterStories.ts, src/types/CharacterStory.ts, src/systems/CharacterStoryManager.ts, src/systems/DialogueManager.ts, src/game/CharacterArt.ts, src/game/KkamangView.ts, src/game/CustomerVisit.ts, src/game/CustomerMeal.ts, src/scenes/BootScene.ts, src/scenes/RestaurantScene.ts, src/scenes/CustomerBookScene.ts, tests/character-story.cjs, package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.
