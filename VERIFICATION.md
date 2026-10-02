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
