// 로컬 스토리지에 단어 저장
function saveWords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    return true;
  } catch (error) {
    console.error('단어 저장 실패:', error);
    alert('단어 저장에 실패했습니다.');
    return false;
  }
}

// 단어 추가
function addWord() {
  const wordText = wordInput.value.trim();
  const pronunciationText = pronunciationInput.value.trim();
  const meaningText = meaningInput.value.trim();

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

  if (!meaningText) {
    alert('뜻을 입력해주세요.');
    meaningInput.focus();
    return;
  }

  // 편집 중인 항목은 제외하고 중복 확인
  if (words.some(w => w.word === wordText && w.id !== editingWordId)) {
    alert('이미 같은 단어가 존재합니다.');
    wordInput.focus();
    return;
  }

  if (editingWordId !== null) {
    const wordToEdit = words.find(word => word.id === editingWordId);
    if (!wordToEdit) {
      cancelEdit();
      return;
    }

    wordToEdit.word = wordText;
    wordToEdit.pronunciation = pronunciationText;
    wordToEdit.meaning = meaningText;
  } else {
    words.unshift({
      id: Date.now(),
      word: wordText,
      pronunciation: pronunciationText,
      meaning: meaningText,
      createdAt: new Date().toLocaleString('ko-KR')
    });
  }

  // 로컬 스토리지에 저장
  if (!saveWords()) {
    return;
  }

  window.location.href = 'index.html';
}