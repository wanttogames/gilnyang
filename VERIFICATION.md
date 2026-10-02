# 0.3.8 검증 결과 · 두부의 작은 보물

## 기존 구조와 범위

두부 ID dubu, 시바견, 어묵/국물 취향은 유지합니다. 기존에는 48×48 normal/blink Image, 공통 CustomerVisit/CustomerMeal 연출과 legacy storyStage 3단계 대사를 사용했습니다. 이번에는 두부만 기존 도트를 분리한 DubuView Container로 렌더링합니다. 꼬리·귀의 원래 정적 픽셀과 도감 이미지는 그대로입니다. 나비의 CharacterStoryManager와 StoryDialogue, CustomerProgress.characterStory(stage/lastEventVisit/lastEventNight/pending), SaveManager.restore를 재사용하며 별도의 스토리/단서/인벤토리 시스템은 없습니다.

## 이벤트 조건

예약 시점의 이번 방문 번호 = 완료된 visitCount + 1입니다. 순서대로 이전 이벤트 완료, 아래 최소 방문/친밀도, 이전 이벤트 이후 방문 간격, 이전 이벤트와 다른 밤을 모두 만족해야 합니다. 한 방문에 하나만 예약되며 대화 커서를 저장합니다.

| 이벤트 | 최소 방문 | 최소 친밀도 | 이전 이벤트 이후 방문 | 위치/연출 |
|---|---:|---:|---:|---|
| 1 맛있는 냄새! | 1 | 0 | 0 | 주문 전 / 활발한 입장 |
| 2 또 뭘 주워왔어? | 3 | 3 | 2 | 주문 전 / 단추 |
| 3 수집가 두부 | 5 | 8 | 2 | 주문 전 / 병뚜껑 / 기존 국물 취향 공개 |
| 4 좋은 걸 가져가고 싶어서 | 7 | 12 | 2 | 식사 후 / 단추 / 마지막 망설임 |
| 5 요즘 늦게 와요 | 10 | 18 | 3 | 식사 후 / 빈손, 느린 입장·억제된 idle |
| 6 이번엔 여기 둘래요 | 13 | 24 | 3 | 주문 전 / 돌 / 완료 |

## 연출과 호환

- 기존 48px/발 y=47/배율 2.5/좌석 기준 유지. 꼬리는 엉덩이 pivot, 귀는 귀 밑 pivot에서 작은 범위로 회전합니다. 기본 꼬리 ±4°/440ms, 밝은 표정 ±7°/300ms, PERFECT ±9°/190ms, 조용한 장면 ±0.3~0.4°/2~2.4초.
- 두부 입장 850ms, 4px 오버런 뒤 170ms 복귀. 조용한 방문은 1400ms, 오버런 없음. 공통 착석/그림자/입력 잠금 유지.
- 3~6초 간격으로 갸웃/냄새 맡기/귀 움직임 중 하나, blink 2.5~5초, 작은 몸 bob. 스토리/식사/이동이 대기 행동보다 우선합니다.
- 단추/병뚜껑/돌은 작은 코드 기반 픽셀 텍스처. heldItem은 캐릭터 자식이므로 함께 이동합니다. 착석 후 옆에 내려놓고 단추/병뚜껑은 퇴장 시 다시 가져갑니다. 마지막 돌은 characterStory 완료 상태만으로 식당 탁자에 복원하며 새 저장 필드가 없습니다.
- NORMAL 기존 작은 끄덕임, GOOD 빠른 꼬리/귀/2개 반짝임, PERFECT 작은 body bob/빠른 꼬리/3개 반짝임. 조용한 이벤트에서는 활발한 반응을 억제합니다. 품질 계산·보상 수치·지급 타이밍은 그대로입니다.
- 친밀도 10 이상 두부는 몇 걸음 후 뒤돌아보고 갸웃합니다. 완료 후에는 빠른 꼬리/작은 끄덕임/빠른 퇴장. 조용한 방문은 억제된 퇴장.
- 기존 v1/v2 저장 및 legacy storyStage/친밀도/방문 횟수/나비 진행 보존. 두부 characterStory가 없는 저장은 stage=0. SaveData 버전과 캐릭터 ID는 변경하지 않았습니다.
- 소유 timer/tween을 상태 전환·퇴장·Scene shutdown/destroy에서 정리합니다. 파츠가 먼저 제거된 shutdown에서는 표정 복원을 실행하지 않습니다. 매 프레임 전용 update/pooling/particle 시스템은 추가하지 않았습니다.

## 검증 결과

- npm run build: TypeScript/Vite 성공. 기존 Phaser 번들 크기 경고만 있습니다.
- npm run test:story: Nabi/Dubu 누락 진행 마이그레이션, v1/v2 경제 보존, 방문/친밀도/밤 게이트, 대화 커서, 순서대로 6단계, 한 방문 하나/중복 방지, 완료 후 정상 상태, 두부 legacy 기록 보존, 콩이 legacy unlock 통과.
- 픽셀 비교: 다섯 주요 손님의 normal/blink 및 나비 꼬리/pivot 데이터 모두 이전 버전과 동일. 두부 body+ear+tail 합성은 원래 normal/blink 픽셀과 일치합니다.
- 실제 RestaurantScene 브라우저: 두부 6개 이벤트를 각각 올바른 이전 진행에서 진입, 주문/식사/대화/퇴장 확인. 단추/병뚜껑/돌 부착 및 내려놓기, 조용한 방문, 완료 돌 복원, 도감 6개 이야기/완료 제목 확인.
- 이벤트 2 주문 전 커서와 이벤트 5 식사 후 커서 새로고침 복원. 골드/친밀도/visitCount 1회 지급, 중복 serve/next 차단, 퇴장 후 다음 손님, 저장 stage 복원 통과.
- 정상 첫 밤 실제 UI 조작: 나비/두부 첫 이야기, 주먹밥/어묵/우유 조리, 손님 5명, 음식 제공/보상, 정산/다음 밤 통과.
- 모바일 320/390px 터치 에뮬레이션: 입장 오버런, 착석 전 주문 차단, idle 자원 상한, 낮은/중간/완료 친밀도 퇴장, 뒤돌아보기, 퇴장 전 다음 손님 차단, 퇴장/Scene 종료 후 timer/tween 0 확인.
- 기존 나비 NORMAL/GOOD/PERFECT/친밀도 하트, 조용한 스토리 우선순위, 까망 반응, 식사 중 재로드, 비/환경 자원 상한, 날씨 전환 및 Scene 재시작 cleanup 통과. 브라우저 오류 없음.
- 모바일 에뮬레이션에서 환경 재시작 검사 rAF 약 59.8fps, 50ms 초과 프레임 0. 실물 저사양 기기 성능은 측정하지 않았습니다.

수정 파일: src/data/characterStories.ts, src/types/CharacterStory.ts, src/systems/DialogueManager.ts, src/game/CharacterArt.ts, src/game/DubuView.ts, src/game/CustomerVisit.ts, src/game/CustomerMeal.ts, src/scenes/BootScene.ts, src/scenes/RestaurantScene.ts, src/scenes/CustomerBookScene.ts, tests/character-story.cjs, package.json, package-lock.json, README.md, CHANGELOG.md, VERIFICATION.md.
