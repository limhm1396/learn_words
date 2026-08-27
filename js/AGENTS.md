# AGENTS.md

## 목적

이 프로젝트는 **Vanilla JavaScript**로 작성되어 있습니다.

코드를 작성하거나 수정할 때 다음 두 가지를 가장 중요하게 생각합니다.

* **함수형 프로그래밍**
* **함수의 원자성**

복잡한 로직을 하나의 큰 함수에 넣지 않고, **작은 함수를 조합하여 구현**합니다.

---

## 1. 함수는 하나의 책임만 가진다

하나의 함수가 여러 종류의 일을 하지 않도록 합니다.

```js
// ❌ 검증 + 변환 + 저장을 모두 수행
function createUser(user) {
  if (!user.email) {
    throw new Error("Email is required");
  }

  user.email = user.email.toLowerCase();

  database.save(user);

  return user;
}
```

각 책임을 분리합니다.

```js
// ✅ 각각 하나의 책임만 수행
function validateUser(user) {
  // 검증
}

function normalizeUser(user) {
  // 변환
}

function saveUser(user) {
  // 저장
}
```

**함수 이름에 `And`, `Or`가 필요하다면 책임이 섞여 있는지 먼저 확인합니다.**

---

## 2. 순수 함수를 우선한다

가능한 경우 **같은 입력에 항상 같은 결과를 반환하는 함수**를 작성합니다.

```js
// ✅ Pure Function
function calculateTotal(items) {
  return items.reduce(
    (total, item) => total + item.price,
    0
  );
}
```

함수 내부에서 다음과 같은 외부 상태 변경을 최소화합니다.

* 전역 변수 변경
* 전달받은 객체/배열 변경
* DOM 변경
* API 요청
* `localStorage` 변경

---

## 3. 데이터를 직접 변경하지 않는다

전달받은 객체나 배열을 가능한 한 변경하지 않고 **새로운 값을 반환**합니다.

```js
// ❌ Mutation
function addItem(items, item) {
  items.push(item);
  return items;
}

// ✅ Immutable
function addItem(items, item) {
  return [...items, item];
}
```

---

## 4. Side Effect는 분리한다

DOM 조작, API 요청, `localStorage`, 이벤트 처리 등의 Side Effect는 비즈니스 로직과 분리합니다.

```js
// ✅ Pure
function calculateDiscount(price, rate) {
  return price * rate;
}

// ✅ Side Effect
function renderPrice(element, price) {
  element.textContent = price;
}
```

가능하다면 다음 구조를 따릅니다.

```text
입력
 ↓
순수 함수
 ↓
결과
 ↓
Side Effect
```

---

## 5. 함수를 조합한다

복잡한 로직은 작은 함수를 조합하여 표현합니다.

```js
function processUser(user) {
  const validated = validateUser(user);
  const normalized = normalizeUser(validated);
  return createUser(normalized);
}
```

상위 함수는 세부 구현을 직접 처리하기보다 **작은 함수들을 조합하는 역할**을 합니다.

---

## 6. 기존 코드를 우선 활용한다

새로운 함수를 만들기 전에 기존에 같은 역할을 하는 함수가 있는지 확인합니다.

불필요한 중복 함수와 추상화를 만들지 않습니다.

기존 코드의 **이름, 구조, 스타일**을 우선적으로 따릅니다.

---

## 7. 과도하게 분리하지 않는다

모든 코드를 한 줄짜리 함수로 만드는 것이 목적은 아닙니다.

다음 기준으로 분리합니다.

> **"이 함수가 하나의 명확한 일을 하고 있는가?"**

원자성을 지키더라도 코드가 지나치게 복잡해진다면 적절하게 합칩니다.

**작은 함수의 개수보다 명확한 책임과 가독성을 우선합니다.**

---

## 8. 코드 작성 전 최종 체크

* [ ] 함수가 하나의 책임만 가지고 있는가?
* [ ] 가능한 부분을 순수 함수로 작성했는가?
* [ ] 객체와 배열을 불필요하게 변경하지 않았는가?
* [ ] Side Effect가 비즈니스 로직과 분리되어 있는가?
* [ ] 기존 함수를 재사용할 수 있는가?
* [ ] 코드를 읽었을 때 함수의 역할이 바로 이해되는가?

## 핵심 원칙

> **작은 함수로 나누고, 순수하게 만들고, 조합한다.**

> **원자성을 지키되 가독성을 해칠 정도로 과도하게 분리하지 않는다.**
