document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("birthdate");
  const calcBtn = document.getElementById("calcBtn");
  const resultArea = document.getElementById("resultArea");
  const realAgeDisplay = document.getElementById("realAge");
  const humanAgeDisplay = document.getElementById("humanAge");
  const speciesRadios = document.getElementsByName("species");
  const refDog = document.getElementById("ref-dog");
  const refCat = document.getElementById("ref-cat");

  // 取得目前選擇的物種
  function getSelectedSpecies() {
    for (const radio of speciesRadios) {
      if (radio.checked) return radio.value;
    }
    return 'dog';
  }

  // 載入對應物種的日期
  function loadDateForSpecies(species) {
    const key = species === 'dog' ? 'dogBirthdate' : 'catBirthdate';
    const savedDate = localStorage.getItem(key);
    dateInput.value = savedDate || "";
  }

  // 儲存日期到對應物種
  function saveDateForSpecies(species, date) {
    const key = species === 'dog' ? 'dogBirthdate' : 'catBirthdate';
    localStorage.setItem(key, date);
  }

  // 從 localStorage 載入已儲存的物種選擇
  const savedSpecies = localStorage.getItem('petSpecies') || 'dog';

  // 設定物種選擇並載入對應日期
  for (const radio of speciesRadios) {
    if (radio.value === savedSpecies) {
      radio.checked = true;
      if (savedSpecies === 'cat') {
        refDog.style.display = 'none';
        refCat.style.display = 'block';
      }
      break;
    }
  }
  loadDateForSpecies(savedSpecies);

  // 切換引用來源顯示 + 儲存選擇 + 載入對應日期
  for (const radio of speciesRadios) {
    radio.addEventListener('change', (e) => {
      const species = e.target.value;
      console.log('切換物種:', species); // debug

      if(species === 'dog') {
        refDog.style.display = 'block';
        refCat.style.display = 'none';
      } else {
        refDog.style.display = 'none';
        refCat.style.display = 'block';
      }

      // 儲存物種選擇到 localStorage
      localStorage.setItem('petSpecies', species);

      // 載入對應物種的日期
      const key = species === 'dog' ? 'dogBirthdate' : 'catBirthdate';
      const savedDate = localStorage.getItem(key);
      console.log('載入日期 key:', key, '值:', savedDate); // debug
      dateInput.value = savedDate || "";

      // 切換時隱藏結果（因為日期可能不同）
      resultArea.style.display = 'none';
    });
  }

  // 日期變更時儲存到對應物種的 localStorage
  dateInput.addEventListener('change', () => {
    const species = getSelectedSpecies();
    saveDateForSpecies(species, dateInput.value);
  });

  calcBtn.addEventListener("click", calculateAge);

  function calculateAge() {
    const dobValue = dateInput.value;
    if (!dobValue) {
      alert("請輸入出生日期！");
      return;
    }

    const dob = new Date(dobValue);
    const today = new Date();
    
    // 計算時間差 (毫秒)
    const diffTime = today - dob;
    
    // 如果出生日期在未來
    if (diffTime < 0) {
      alert("出生日期不能在未來！");
      return;
    }

    // 計算實際年齡 (用於顯示：歲/月)
    const ageDate = new Date(diffTime); // 自1970年開始的時間
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = ageDate.getUTCMonth();
    const days = ageDate.getUTCDate() - 1;

    // 計算精確年齡 (浮點數，用於公式計算)
    const exactYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

    // 取得選擇的物種
    let species = 'dog';
    for (const radio of speciesRadios) {
      if (radio.checked) {
        species = radio.value;
        break;
      }
    }

    let humanAge = 0;

    if (species === 'dog') {
      // 根據 Cell Systems (Wang et al. 2020) 公式
      // 公式: 16 * ln(age) + 31
      // 注意：此公式對非常幼小的狗 (<0.15歲 也就是約2個月大) 會得出負數或極小值
      // 我們為幼犬做一個簡單的線性過渡，避免負數，但主要依賴公式
      
      if (exactYears < 0.25) {
        // 小於3個月大，公式會失效，暫時用線性估算 (僅作UI保護，避免顯示負歲數)
        // 3個月大約是人類 5-8 歲
        humanAge = exactYears * 25; 
      } else {
        humanAge = 16 * Math.log(exactYears) + 31;
      }

    } else {
      // 根據 AAHA 2021 Feline Guidelines
      // 0-1 歲: 成長到 15 歲
      // 1-2 歲: 成長到 24 歲 (+9)
      // 2歲以上: 每年 +4
      
      if (exactYears <= 1) {
        humanAge = exactYears * 15;
      } else if (exactYears <= 2) {
        // 第一年是15，第二年增加9
        humanAge = 15 + ((exactYears - 1) * 9);
      } else {
        // 2歲是24，之後每年+4
        humanAge = 24 + ((exactYears - 2) * 4);
      }
    }

    // 更新 UI
    realAgeDisplay.textContent = `${years} 歲 ${months} 個月`;
    humanAgeDisplay.textContent = `${Math.round(humanAge)} 歲`; // 四捨五入
    resultArea.style.display = "flex";
  }
  
  // 初始化執行一次（為了顯示預設值的結果，可選）
  // calculateAge(); 
});