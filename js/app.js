// 로컬 스토리지 키
const STORAGE_KEY = 'learnWords';

// DOM 요소
const wordInput = document.getElementById('word-input');
const pronunciationInput = document.getElementById('pronunciation-input');
const meaningInput = document.getElementById('meaning-input');
const addBtn = document.getElementById('add-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const backupBtn = document.getElementById('backup-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file-input');
const wordsList = document.getElementById('words-list');
const wordCount = document.getElementById('word-count');
const startTestBtn = document.getElementById('start-test-btn');
const startSurvivalBtn = document.getElementById('start-survival-btn');
const wordTabList = document.getElementById('word-tab-list');
const addTabBtn = document.getElementById('add-tab-btn');
const renameTabBtn = document.getElementById('rename-tab-btn');
const deleteTabBtn = document.getElementById('delete-tab-btn');
const SURVIVAL_DATE_KEY = 'survivalTestDate';
const TABS_STORAGE_KEY = 'learnWordTabs';
const ACTIVE_TAB_STORAGE_KEY = 'activeLearnWordTab';

// 저장된 단어 배열
let words = [];
let tabs = [];
let activeTabId = null;
let editingWordId = null;

// 초기화 함수
function init() {
  loadTabs();
  loadWords();
  activeTabId = tabs.some(tab => tab.id === localStorage.getItem(ACTIVE_TAB_STORAGE_KEY))
    ? localStorage.getItem(ACTIVE_TAB_STORAGE_KEY)
    : tabs[0].id;
  saveTabs();
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
  renderTabs();
  renderWordsList();
  addBtn.addEventListener('click', addWord);
  cancelEditBtn.addEventListener('click', cancelEdit);
  clearAllBtn.addEventListener('click', clearAllWords);
  backupBtn.addEventListener('click', backupWords);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importWords);
  addTabBtn.addEventListener('click', addTab);
  renameTabBtn.addEventListener('click', renameActiveTab);
  deleteTabBtn.addEventListener('click', deleteActiveTab);
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

function createTabId() {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadTabs() {
  try {
    const savedTabs = JSON.parse(localStorage.getItem(TABS_STORAGE_KEY));
    tabs = Array.isArray(savedTabs)
      ? savedTabs.filter(tab => tab && typeof tab.id === 'string' && typeof tab.name === 'string' && tab.name.trim())
      : [];
  } catch (error) {
    console.error('탭 불러오기 실패:', error);
    tabs = [];
  }

  if (tabs.length === 0) {
    tabs = [{ id: createTabId(), name: '기본' }];
  }
}

function saveTabs() {
  try {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    return true;
  } catch (error) {
    console.error('탭 저장 실패:', error);
    alert('탭 저장에 실패했습니다.');
    return false;
  }
}

function renderTabs() {
  wordTabList.innerHTML = '';
  tabs.forEach(tab => {
    const tabButton = document.createElement('button');
    tabButton.type = 'button';
    tabButton.className = 'word-tab';
    tabButton.textContent = tab.name;
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-selected', String(tab.id === activeTabId));
    tabButton.classList.toggle('is-active', tab.id === activeTabId);
    tabButton.addEventListener('click', () => selectTab(tab.id));
    wordTabList.appendChild(tabButton);
  });
  deleteTabBtn.disabled = tabs.length <= 1;
}

function selectTab(tabId) {
  if (editingWordId !== null) {
    const editedWord = words.find(word => word.id === editingWordId);
    if (editedWord && editedWord.tabId !== tabId) cancelEdit();
  }
  activeTabId = tabId;
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
  renderTabs();
  renderWordsList();
}

function addTab() {
  const name = prompt('새 탭 이름을 입력하세요:');
  if (name === null) return;
  const trimmedName = name.trim();
  if (!trimmedName) {
    alert('탭 이름을 입력해주세요.');
    return;
  }
  if (tabs.some(tab => tab.name === trimmedName)) {
    alert('같은 이름의 탭이 이미 있습니다.');
    return;
  }

  const newTab = { id: createTabId(), name: trimmedName };
  tabs.push(newTab);
  if (!saveTabs()) return;
  selectTab(newTab.id);
}

function renameActiveTab() {
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  if (!activeTab) return;
  const name = prompt('새 탭 이름을 입력하세요:', activeTab.name);
  if (name === null) return;
  const trimmedName = name.trim();
  if (!trimmedName) {
    alert('탭 이름을 입력해주세요.');
    return;
  }
  if (tabs.some(tab => tab.id !== activeTabId && tab.name === trimmedName)) {
    alert('같은 이름의 탭이 이미 있습니다.');
    return;
  }

  activeTab.name = trimmedName;
  if (saveTabs()) renderTabs();
}

function deleteActiveTab() {
  if (tabs.length <= 1) {
    alert('마지막 탭은 삭제할 수 없습니다.');
    return;
  }
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  if (!activeTab) return;
  const tabWordCount = words.filter(word => word.tabId === activeTabId).length;
  if (!confirm(`'${activeTab.name}' 탭과 포함된 단어 ${tabWordCount}개를 모두 삭제할까요?`)) return;

  words = words.filter(word => word.tabId !== activeTabId);
  tabs = tabs.filter(tab => tab.id !== activeTabId);
  activeTabId = tabs[0].id;
  localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
  if (saveTabs() && saveWords()) {
    renderTabs();
    renderWordsList();
  }
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
    words.forEach(word => {
      if (!word.tabId || !tabs.some(tab => tab.id === word.tabId)) {
        word.tabId = tabs[0].id;
      }
    });
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
  const activeWords = words.filter(word => word.tabId === activeTabId);
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  if (activeWords.length === 0 || !confirm(`'${activeTab.name}' 탭의 단어 ${activeWords.length}개를 모두 삭제하시겠습니까?`)) return;

  words = words.filter(word => word.tabId !== activeTabId);
  editingWordId = null;
  saveWords();
  renderWordsList();
  cancelEdit();
}

function createBackupFileName() {
  return `learn-words-backup-${getToday()}.json`;
}

function downloadBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = createBackupFileName();
  link.click();
  URL.revokeObjectURL(url);
}

function backupWords() {
  if (words.length === 0) {
    alert('백업할 단어가 없습니다.');
    return;
  }

  const backup = {
    version: 2,
    tabs: tabs.map(tab => ({
      name: tab.name,
      words: words
        .filter(word => word.tabId === tab.id)
        .map(({ id, word, pronunciation, meaning, createdAt }) => ({ id, word, pronunciation, meaning, createdAt }))
    }))
  };
  downloadBackup(backup);
}

function isValidWord(word) {
  return word &&
    (typeof word.id === 'number' || typeof word.id === 'string') &&
    typeof word.word === 'string' &&
    typeof word.pronunciation === 'string' &&
    typeof word.meaning === 'string';
}

function parseImportedWords(fileContents) {
  const importedWords = JSON.parse(fileContents);
  if (Array.isArray(importedWords) && importedWords.every(isValidWord)) {
    return { tabs: [{ name: '기본', words: importedWords }], words: importedWords.map(word => ({ ...word, tabName: '기본' })) };
  }
  if (!importedWords || !Array.isArray(importedWords.tabs) || !importedWords.tabs.every(tab =>
    tab && typeof tab.name === 'string' && tab.name.trim() && Array.isArray(tab.words) && tab.words.every(isValidWord)
  )) {
    throw new Error('잘못된 단어 백업 파일 형식입니다.');
  }
  return {
    tabs: importedWords.tabs,
    words: importedWords.tabs.flatMap(tab => tab.words.map(word => ({ ...word, tabName: tab.name })))
  };
}

function mergeWords(existingWords, importedWords) {
  const mergedTabs = [...tabs];
  const tabIdsByName = new Map(mergedTabs.map(tab => [tab.name, tab.id]));
  importedWords.tabs.forEach(importedTab => {
    if (!tabIdsByName.has(importedTab.name)) {
      const newTab = { id: createTabId(), name: importedTab.name };
      mergedTabs.push(newTab);
      tabIdsByName.set(newTab.name, newTab.id);
    }
  });
  const knownWords = new Set(existingWords.map(word => word.word));
  const newWords = importedWords.words.reduce((result, { tabName, ...word }) => {
    if (!knownWords.has(word.word)) {
      knownWords.add(word.word);
      result.push({ ...word, tabId: tabIdsByName.get(tabName) || mergedTabs[0].id });
    }
    return result;
  }, []);
  return {
    tabs: mergedTabs,
    words: [...existingWords, ...newWords],
    addedCount: newWords.length
  };
}

function importWords(event) {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;

  file.text()
    .then(parseImportedWords)
    .then(importedData => {
      const mergedWords = mergeWords(words, importedData);
      if (!confirm(`${mergedWords.addedCount}개의 새 단어를 추가하시겠습니까? 기존 단어는 유지됩니다.`)) return;
      tabs = mergedWords.tabs;
      words = mergedWords.words;
      editingWordId = null;
      if (saveTabs() && saveWords()) {
        renderTabs();
        renderWordsList();
        cancelEdit();
        alert(`${mergedWords.addedCount}개의 단어를 추가했습니다.`);
      }
    })
    .catch(error => {
      console.error('단어 불러오기 실패:', error);
      alert('단어 백업 파일을 읽을 수 없습니다.');
    });
}

// 단어 목록 렌더링
function renderWordsList() {
  const activeWords = words.filter(word => word.tabId === activeTabId);
  // 단어 개수 업데이트
  wordCount.textContent = activeWords.length;
  clearAllBtn.disabled = activeWords.length === 0;

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
  if (activeWords.length === 0) {
    wordsList.innerHTML = '<p class="empty-message">아직 저장된 단어가 없습니다.</p>';
    return;
  }

  // 단어 렌더링
  activeWords.forEach(word => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    wordItem.innerHTML = `
      <div class="word-content">
        <p class="word-text">${escapeHtml(word.word)}</p>
        <p class="word-pronunciation">발음: ${escapeHtml(word.pronunciation)}</p>
        <p class="word-meaning">뜻: ${escapeHtml(word.meaning || '')}</p>
      </div>
      <div class="word-actions">
        <button class="btn btn-edit" type="button">편집</button>
        <button class="btn btn-danger" type="button">삭제</button>
      </div>
    `;
    wordItem.querySelector('.btn-edit').addEventListener('click', () => editWord(word.id));
    wordItem.querySelector('.btn-danger').addEventListener('click', () => deleteWord(word.id));
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
