const STORAGE_KEY = 'learnWords';

const currentWord = document.getElementById('current-word');
const currentPronunciation = document.getElementById('current-pronunciation');
const currentMeaning = document.getElementById('current-meaning');
const pronunciationCard = document.getElementById('pronunciation-card');
const meaningCard = document.getElementById('meaning-card');
const showPronunciationBtn = document.getElementById('show-pronunciation-btn');
const speakPronunciationBtn = document.getElementById('speak-pronunciation-btn');
const showMeaningBtn = document.getElementById('show-meaning-btn');
const retryBtn = document.getElementById('retry-btn');
const passBtn = document.getElementById('pass-btn');
const exitTestBtn = document.getElementById('exit-test-btn');
const currentIndex = document.getElementById('current-index');
const totalWords = document.getElementById('total-words');
const progressFill = document.getElementById('progress-fill');
const isSurvivalTest = new URLSearchParams(window.location.search).get('mode') === 'survival';

let testWords = [];
let retryWords = [];
let currentWordIndex = 0;

function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error('단어 불러오기 실패:', error);
    return [];
  }
}

function shuffleArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
}

function showCurrentWord() {
  window.speechSynthesis?.cancel();

  if (currentWordIndex >= testWords.length) {
    finishTest();
    return;
  }

  const word = testWords[currentWordIndex];
  currentWord.textContent = word.word;
  currentPronunciation.textContent = word.pronunciation;
  currentMeaning.textContent = word.meaning || '';
  pronunciationCard.style.display = 'none';
  meaningCard.style.display = 'none';
  showPronunciationBtn.style.visibility = 'visible';
  showMeaningBtn.style.visibility = 'visible';
  showPronunciationBtn.textContent = '발음';
  showMeaningBtn.textContent = '뜻';
  currentIndex.textContent = currentWordIndex + 1;
  totalWords.textContent = testWords.length;
  if (progressFill) {
    progressFill.style.width = `${((currentWordIndex + 1) / testWords.length) * 100}%`;
  }
}

function toggleCard(card) {
  const isHidden = card.style.display === 'none';
  card.style.display = isHidden ? 'block' : 'none';
}

function showPronunciation() {
  showPronunciationBtn.style.visibility = 'hidden';
  toggleCard(pronunciationCard);
}

function speakPronunciation() {
  const pronunciation = currentPronunciation.textContent.trim();

  if (!pronunciation || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(pronunciation);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.75;
  window.speechSynthesis.speak(utterance);
}

function showMeaning() {
  showMeaningBtn.style.visibility = 'hidden';
  toggleCard(meaningCard);
}

function exitTest() {
  if (confirm('시험을 종료하시겠습니까?')) {
    window.location.href = 'index.html';
  }
}

function finishTest() {
  if (isSurvivalTest || retryWords.length === 0) {
    alert('시험이 완료되었습니다!');
    window.location.href = 'index.html';
    return;
  }

  if (confirm(`다시 공부할 단어가 ${retryWords.length}개 있습니다.\n다시 공부하시겠습니까?`)) {
    testWords = [...retryWords];
    shuffleArray(testWords);
    retryWords = [];
    currentWordIndex = 0;
    showCurrentWord();
  } else {
    window.location.href = 'index.html';
  }
}

function initializeTest() {
  testWords = loadWords();
  if (testWords.length === 0) {
    alert('단어가 없습니다.');
    window.location.href = 'index.html';
    return;
  }

  shuffleArray(testWords);
  showPronunciationBtn.addEventListener('click', showPronunciation);
  speakPronunciationBtn.addEventListener('click', speakPronunciation);
  showMeaningBtn.addEventListener('click', showMeaning);
  retryBtn.addEventListener('click', () => {
    retryWords = [...retryWords, testWords[currentWordIndex]];
    currentWordIndex++;
    showCurrentWord();
  });
  passBtn.addEventListener('click', () => {
    if (isSurvivalTest) {
      removeWordFromStorage(testWords[currentWordIndex].id);
    }
    currentWordIndex++;
    showCurrentWord();
  });
  exitTestBtn.addEventListener('click', exitTest);
  showCurrentWord();
}

function removeWordFromStorage(wordId) {
  const words = loadWords().filter(word => word.id !== wordId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

document.addEventListener('DOMContentLoaded', initializeTest);