// 로컬 스토리지 키
const STORAGE_KEY = 'learnWords';

// DOM 요소
const wordInput = document.getElementById('word-input');
const pronunciationInput = document.getElementById('pronunciation-input');
const meaningInput = document.getElementById('meaning-input');
const addBtn = document.getElementById('add-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const wordsList = document.getElementById('words-list');
const wordCount = document.getElementById('word-count');
const startTestBtn = document.getElementById('start-test-btn');
const startSurvivalBtn = document.getElementById('start-survival-btn');
const SURVIVAL_DATE_KEY = 'survivalTestDate';

// 저장된 단어 배열
let words = [];
let editingWordId = null;

// 초기화 함수
function init() {
  loadWords();
  renderWordsList();
  addBtn.addEventListener('click', addWord);
  cancelEditBtn.addEventListener('click', cancelEdit);
  clearAllBtn.addEventListener('click', clearAllWords);
  startSurvivalBtn.addEventListener('click', startSurvivalTest);
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWord();
  });
  pronunciationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWord();
  });
  meaningInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWord();
  });
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

// 저장된 단어를 편집 모드로 전환
function editWord(id) {
  const wordToEdit = words.find(word => word.id === id);
  if (!wordToEdit) return;

  editingWordId = id;
  wordInput.value = wordToEdit.word;
  pronunciationInput.value = wordToEdit.pronunciation;
  meaningInput.value = wordToEdit.meaning || '';
  addBtn.textContent = '저장';
  cancelEditBtn.style.display = 'block';
  wordInput.focus();
  document.querySelector('.add-word-section').scrollIntoView({ behavior: 'smooth' });
}

// 편집 취소
function cancelEdit() {
  editingWordId = null;
  wordInput.value = '';
  pronunciationInput.value = '';
  meaningInput.value = '';
  addBtn.textContent = '추가';
  cancelEditBtn.style.display = 'none';
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

// 저장된 단어 전체 삭제
function clearAllWords() {
  if (words.length === 0 || !confirm('저장된 단어를 모두 삭제하시겠습니까?')) return;

  words = [];
  editingWordId = null;
  saveWords();
  renderWordsList();
  cancelEdit();
}

// 단어 목록 렌더링
function renderWordsList() {
  // 단어 개수 업데이트
  wordCount.textContent = words.length;
  clearAllBtn.disabled = words.length === 0;

  // 단어 리스트 비우기
  wordsList.innerHTML = '';

  // 시험 버튼 표시 여부
  if (words.length > 0) {
    startTestBtn.style.display = 'block';
    startSurvivalBtn.style.display = 'block';
  } else {
    startTestBtn.style.display = 'none';
    startSurvivalBtn.style.display = 'none';
  }

  const survivalUsedToday = localStorage.getItem(SURVIVAL_DATE_KEY) === getToday();
  startSurvivalBtn.classList.toggle('is-disabled', survivalUsedToday);
  startSurvivalBtn.setAttribute('aria-disabled', survivalUsedToday ? 'true' : 'false');
  startSurvivalBtn.textContent = survivalUsedToday ? '오늘 시험 완료' : startSurvivalBtn.textContent;

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
        <p class="word-pronunciation">발음: ${escapeHtml(word.pronunciation)}</p>
        <p class="word-meaning">뜻: ${escapeHtml(word.meaning || '')}</p>
      </div>
      <div class="word-actions">
        <button class="btn btn-edit" onclick="editWord(${word.id})">편집</button>
        <button class="btn btn-danger" onclick="deleteWord(${word.id})">삭제</button>
      </div>
    `;
    wordsList.appendChild(wordItem);
  });
}

function getToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function startSurvivalTest(event) {
  if (localStorage.getItem(SURVIVAL_DATE_KEY) === getToday()) {
    event.preventDefault();
    alert('서바이벌 시험은 하루에 한 번만 할 수 있습니다.');
    return;
  }

  localStorage.setItem(SURVIVAL_DATE_KEY, getToday());
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);
