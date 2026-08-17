// 로컬 스토리지 키
const STORAGE_KEY = 'learnWords';

// DOM 요소
const wordInput = document.getElementById('word-input');
const pronunciationInput = document.getElementById('pronunciation-input');
const addBtn = document.getElementById('add-btn');
const wordsList = document.getElementById('words-list');
const wordCount = document.getElementById('word-count');
const startTestBtn = document.getElementById('start-test-btn');
const testSection = document.getElementById('test-section');
const currentWord = document.getElementById('current-word');
const currentPronunciation = document.getElementById('current-pronunciation');
const pronunciationCard = document.getElementById('pronunciation-card');
const showPronunciationBtn = document.getElementById('show-pronunciation-btn');
const retryBtn = document.getElementById('retry-btn');
const passBtn = document.getElementById('pass-btn');
const exitTestBtn = document.getElementById('exit-test-btn');
const currentIndex = document.getElementById('current-index');
const totalWords = document.getElementById('total-words');
const progressFill = document.getElementById('progress-fill');

// 저장된 단어 배열
let words = [];

// 시험 관련 변수
let testWords = [];
let retryWords = [];
let currentWordIndex = 0;

// 초기화 함수
function init() {
  loadWords();
  renderWordsList();
  addBtn.addEventListener('click', addWord);
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWord();
  });
  pronunciationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWord();
  });
  startTestBtn.addEventListener('click', startTest);
  showPronunciationBtn.addEventListener('click', togglePronunciation);
  retryBtn.addEventListener('click', retryWord);
  passBtn.addEventListener('click', passWord);
  exitTestBtn.addEventListener('click', exitTest);
}

// 로컬 스토리지에서 단어 불러오기
function loadWords() {
  try {
    const savedWords = localStorage.getItem(STORAGE_KEY);
    if (savedWords) {
      words = JSON.parse(savedWords);
    } else {
      words = [];
    }
  } catch (error) {
    console.error('단어 불러오기 실패:', error);
    words = [];
  }
}

// 로컬 스토리지에 단어 저장
function saveWords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.error('단어 저장 실패:', error);
    alert('단어 저장에 실패했습니다.');
  }
}

// 단어 추가
function addWord() {
  const wordText = wordInput.value.trim();
  const pronunciationText = pronunciationInput.value.trim();

  // 유효성 검사
  if (!wordText) {
    alert('단어를 입력해주세요.');
    wordInput.focus();
    return;
  }

  if (!pronunciationText) {
    alert('발음을 입력해주세요.');
    pronunciationInput.focus();
    return;
  }

  // 중복 확인
  if (words.some(w => w.word === wordText)) {
    alert('이미 같은 단어가 존재합니다.');
    wordInput.focus();
    return;
  }

  // 새로운 단어 객체
  const newWord = {
    id: Date.now(),
    word: wordText,
    pronunciation: pronunciationText,
    createdAt: new Date().toLocaleString('ko-KR')
  };

  // 단어 배열에 추가
  words.unshift(newWord);

  // 로컬 스토리지에 저장
  saveWords();

  // UI 업데이트
  renderWordsList();

  // 입력 필드 초기화
  wordInput.value = '';
  pronunciationInput.value = '';
  wordInput.focus();
}

// 단어 삭제
function deleteWord(id) {
  if (confirm('이 단어를 삭제하시겠습니까?')) {
    words = words.filter(w => w.id !== id);
    saveWords();
    renderWordsList();
  }
}

// 단어 목록 렌더링
function renderWordsList() {
  // 단어 개수 업데이트
  wordCount.textContent = words.length;

  // 단어 리스트 비우기
  wordsList.innerHTML = '';

  // 시험 버튼 표시 여부
  if (words.length > 0) {
    startTestBtn.style.display = 'block';
  } else {
    startTestBtn.style.display = 'none';
  }

  // 단어가 없을 경우
  if (words.length === 0) {
    wordsList.innerHTML = '<p class="empty-message">아직 저장된 단어가 없습니다.</p>';
    return;
  }

  // 단어 렌더링
  words.forEach(word => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    wordItem.innerHTML = `
      <div class="word-content">
        <p class="word-text">${escapeHtml(word.word)}</p>
        <p class="word-pronunciation">${escapeHtml(word.pronunciation)}</p>
      </div>
      <div class="word-actions">
        <button class="btn btn-danger" onclick="deleteWord(${word.id})">삭제</button>
      </div>
    `;
    wordsList.appendChild(wordItem);
  });
}

// 시험 시작
function startTest() {
  if (words.length === 0) {
    alert('단어가 없습니다.');
    return;
  }

  // 단어 배열 복사 및 섞기
  testWords = JSON.parse(JSON.stringify(words));
  shuffleArray(testWords);
  retryWords = [];

  currentWordIndex = 0;
  
  // UI 업데이트
  document.querySelector('.add-word-section').style.display = 'none';
  document.querySelector('.words-list-section').style.display = 'none';
  testSection.style.display = 'block';

  // 첫 번째 단어 표시
  showCurrentWord();
}

// 배열 섞기 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 현재 단어 표시
function showCurrentWord() {
  if (currentWordIndex >= testWords.length) {
    finishTest();
    return;
  }

  const word = testWords[currentWordIndex];
  currentWord.textContent = escapeHtml(word.word);
  currentPronunciation.textContent = escapeHtml(word.pronunciation);
  pronunciationCard.style.display = 'none';
  showPronunciationBtn.textContent = '발음 보기';

  // 진행률 업데이트
  currentIndex.textContent = currentWordIndex + 1;
  totalWords.textContent = testWords.length;
  const progress = ((currentWordIndex + 1) / testWords.length) * 100;
  progressFill.style.width = progress + '%';
}

// 발음 토글
function togglePronunciation() {
  if (pronunciationCard.style.display === 'none') {
    pronunciationCard.style.display = 'block';
    showPronunciationBtn.textContent = '발음 숨기기';
  } else {
    pronunciationCard.style.display = 'none';
    showPronunciationBtn.textContent = '발음 보기';
  }
}

// 다시공부 (현재 단어를 다시공부 목록에 추가)
function retryWord() {
  const currentWord = testWords[currentWordIndex];
  retryWords.push(currentWord);
  currentWordIndex++;
  showCurrentWord();
}

// 패스 (다음 단어로)
function passWord() {
  currentWordIndex++;
  showCurrentWord();
}

// 시험 종료
function exitTest() {
  if (confirm('시험을 종료하시겠습니까?')) {
    testSection.style.display = 'none';
    document.querySelector('.add-word-section').style.display = 'block';
    document.querySelector('.words-list-section').style.display = 'block';
    testWords = [];
    retryWords = [];
    currentWordIndex = 0;
  }
}

// 시험 완료
function finishTest() {
  if (retryWords.length > 0) {
    const message = `다시공부할 단어가 ${retryWords.length}개 있습니다.\n다시 공부하시겠습니까?`;
    if (confirm(message)) {
      // 사용자가 "예"를 선택했을 때
      const shuffleChoice = confirm('단어를 섞어서 공부하시겠습니까?\n(확인: 섞기, 취소: 순서대로)');
      restartWithRetryWords(shuffleChoice);
    } else {
      // 사용자가 "아니오"를 선택했을 때
      exitTest();
    }
  } else {
    alert('시험이 완료되었습니다!');
    exitTest();
  }
}

// 다시공부 단어로 시험 재시작
function restartWithRetryWords(shuffle) {
  testWords = JSON.parse(JSON.stringify(retryWords));
  
  if (shuffle) {
    shuffleArray(testWords);
  }
  
  retryWords = [];
  currentWordIndex = 0;
  
  // 첫 번째 단어 표시
  showCurrentWord();
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
