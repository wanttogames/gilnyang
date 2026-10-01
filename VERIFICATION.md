# 0.2.3 검증 결과

## 변경 범위
0.2.2 소스와 비교: OdenCooking, CookingManager의 어묵 판정, cookingSteps의 어묵 데이터, OdenCookingConfig, 조리 CSS와 한글 글꼴만 변경했습니다. 주먹밥 단계/판정, 레시피/캐릭터/대사/날씨 데이터, SaveManager, ProgressionManager, RestaurantScene은 동일합니다. 버전과 문서만 함께 갱신했습니다.

## 빌드
npm run build 성공. TypeScript strict 및 Vite production build 통과. 기존 Phaser 번들 크기 경고만 있습니다.

## 실제 브라우저 회귀 테스트
Headless Chromium에서 마우스 클릭과 실제 터치 이벤트로 검증했습니다. 물리 휴대폰의 진동/스피커 체감은 별도 확인이 필요합니다.

- PC 720×900: 주먹밥 PERFECT → 어묵 PERFECT → 다음 까망 주문 → 새로고침 복원 → 어묵 NORMAL → 기존 우유 → 주먹밥 → 5명 정산 → 정산 새로고침 → 다음 밤.
- PERFECT 제공 시 기존 +15 골드/+3 친밀도, 주먹밥+어묵 이후 30골드 확인.
- 모바일 390/320×900: 어묵 3개 각각 PERFECT, 골드 +15.
- 모바일 320: PERFECT 직후 GOOD 유예 상태에서 건지기 → GOOD, 골드 +12.
- 모바일 390: 즉시 건지기 → NORMAL. 모바일 320: 모두 퍼진 후 건지기 → NORMAL. 각각 골드 +10, 손님 이탈 없이 완료.
- 각 꼬치 카드 터치 영역 너비/높이 44 CSS px 이상, 결과 버튼 패널 내부 배치 확인. 320px 스크린샷 시각 검토 완료.
- 건진 꼬치 입력 비활성화, 즉시 점수/등급 표시 확인.
- 모바일 각 판정 제공 후 정산/다음 밤/재접속의 골드 유지와 비 날씨 저장 확인.
- 어묵 상태의 설익음/GOOD/PERFECT/후반 GOOD/퍼짐 점수 분기 확인.
- 기존 조건 충족 시 계란 라면/붕어빵 해금 로직 확인.
- JavaScript 런타임 오류 없음.

## 단일 HTML
file:// 실제 터치 실행: 첫 밤 열기 → 주먹밥 3단계 → 서빙 → 두부 어묵 3개 → 결과 → 서빙. 포함 글꼴 로드 성공, HTTP/HTTPS 외부 요청 0건, JavaScript 오류 0건.

## 손맛/접근성
건지기 직후 들림/착지/물방울과 판정별 합성 효과음 구현. 기존 소리 끄기 설정 유지. prefers-reduced-motion에서는 애니메이션 없이 건진 위치만 표시합니다. 물리 휴대폰에서 소리와 움직임을 직접 평가해 후속 수치를 조정하면 좋습니다.
