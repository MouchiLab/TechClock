
let is24Hour = true;
let isTaiwanTime = true;
let isMinGuo = true;
let isControlMode = false;

const twTimeBtn = document.getElementById('tw-time-btn');
const utcTimeBtn = document.getElementById('utc-time-btn');
const formatBtn = document.getElementById('format-btn');
const yearFormatBtn = document.getElementById('year-format-btn');
const shareBtn = document.getElementById('share-btn');
const date = document.getElementById('date');
const timezoneLabel = document.getElementById('timezone-label');
const controls = document.getElementById('controls');
const modeToggle = document.getElementById('mode-toggle');
const settingsIcon = document.getElementById('settings-icon');
const displayIcon = document.getElementById('display-icon');
const toast = document.getElementById('toast');

function updateButtonStates() {
    if (!isTaiwanTime) {
        isMinGuo = false;
        is24Hour = true;
        yearFormatBtn.classList.add('disabled');
        formatBtn.classList.add('disabled');
        yearFormatBtn.textContent = '西元年';
        formatBtn.textContent = '24小時制';
        yearFormatBtn.classList.remove('active');
        formatBtn.classList.add('active');
    } else {
        yearFormatBtn.classList.remove('disabled');
        formatBtn.classList.remove('disabled');
    }
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        timezone: params.get('tz'),
        format: params.get('fmt'),
        year: params.get('year')
    };
}

function updateUrlParams() {
    const params = new URLSearchParams();
    if (!isTaiwanTime) params.set('tz', 'utc');
    if (!is24Hour && isTaiwanTime) params.set('fmt', '12');
    if (!isMinGuo && isTaiwanTime) params.set('year', 'ad');
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

shareBtn.addEventListener('click', async () => {
    const currentUrl = window.location.href;
    try {
        await navigator.clipboard.writeText(currentUrl);
        showToast('連結已複製到剪貼簿');
    } catch (err) {
        showToast('複製失敗，請手動複製網址');
    }
});

const urlParams = getUrlParams();
if (urlParams.timezone === 'utc') {
    isTaiwanTime = false;
    twTimeBtn.classList.remove('active');
    utcTimeBtn.classList.add('active');
    timezoneLabel.textContent = 'UTC TIME';
}
if (urlParams.format === '12' && isTaiwanTime) {
    is24Hour = false;
    formatBtn.textContent = '12小時制';
    formatBtn.classList.remove('active');
}
if (urlParams.year === 'ad' && isTaiwanTime) {
    isMinGuo = false;
    yearFormatBtn.textContent = '西元年';
    yearFormatBtn.classList.remove('active');
}

updateButtonStates();

yearFormatBtn.addEventListener('click', () => {
    if (!yearFormatBtn.classList.contains('disabled')) {
        isMinGuo = !isMinGuo;
        yearFormatBtn.textContent = isMinGuo ? '民國年' : '西元年';
        yearFormatBtn.classList.toggle('active', isMinGuo);
        updateUrlParams();
        updateClock();
    }
});

modeToggle.addEventListener('click', () => {
    isControlMode = !isControlMode;
    controls.classList.toggle('hidden', !isControlMode);
    settingsIcon.classList.toggle('hidden', !isControlMode);
    displayIcon.classList.toggle('hidden', isControlMode);
    modeToggle.title = isControlMode ? '切換顯示模式' : '切換控制模式';
});

twTimeBtn.addEventListener('click', () => {
    isTaiwanTime = true;
    twTimeBtn.classList.add('active');
    utcTimeBtn.classList.remove('active');
    timezoneLabel.textContent = 'TAIWAN LOCAL TIME';
    updateButtonStates();
    updateUrlParams();
    updateClock();
});

utcTimeBtn.addEventListener('click', () => {
    isTaiwanTime = false;
    utcTimeBtn.classList.add('active');
    twTimeBtn.classList.remove('active');
    timezoneLabel.textContent = 'UTC TIME';
    updateButtonStates();
    updateUrlParams();
    updateClock();
});

formatBtn.addEventListener('click', () => {
    if (!formatBtn.classList.contains('disabled')) {
        is24Hour = !is24Hour;
        formatBtn.textContent = is24Hour ? '24小時制' : '12小時制';
        formatBtn.classList.toggle('active', is24Hour);
        updateUrlParams();
        updateClock();
    }
});

function updateClock() {
    const now = new Date();
    let displayHours, displayMinutes, displaySeconds, meridiem;
    
    if (isTaiwanTime) {
        displayHours = now.getHours();
        displayMinutes = now.getMinutes();
        displaySeconds = now.getSeconds();
    } else {
        displayHours = now.getUTCHours();
        displayMinutes = now.getUTCMinutes();
        displaySeconds = now.getUTCSeconds();
    }

    meridiem = '';
    if (!is24Hour && isTaiwanTime) {
        meridiem = displayHours >= 12 ? 'PM' : 'AM';
        displayHours = displayHours % 12;
        displayHours = displayHours || 12;
    }

    const timeStr = `${String(displayHours).padStart(2, '0')}:${
        String(displayMinutes).padStart(2, '0')}:${
        String(displaySeconds).padStart(2, '0')}`;
    
    document.getElementById('time').textContent = timeStr;
    document.getElementById('meridiem').textContent = meridiem;
    
    const year = isTaiwanTime ? now.getFullYear() : now.getUTCFullYear();
    const month = isTaiwanTime ? 
        String(now.getMonth() + 1).padStart(2, '0') : 
        String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = isTaiwanTime ? 
        String(now.getDate()).padStart(2, '0') : 
        String(now.getUTCDate()).padStart(2, '0');

    if (isMinGuo && isTaiwanTime) {
        const twYear = year - 1911;
        date.textContent = `民國${twYear}年${month}月${day}日`;
    } else {
        date.textContent = `${year}年${month}月${day}日`;
    }
    
    if (isTaiwanTime) {
        checkFestival(month, day);
    } else {
        document.getElementById('festival').textContent = '';
    }
}

function checkFestival(month, date) {
    const festivals = {
        '0101': '元旦',
        '0128': '農曆新年',
        '0214': '情人節',
        '0228': '和平紀念日',
        '0404': '兒童節',
        '0501': '勞動節',
        '0508': '母親節',
        '0928': '教師節',
        '1010': '國慶日',
        '1225': '聖誕節'
    };
    
    const key = month + date;
    document.getElementById('festival').textContent = 
        festivals[key] ? `今日節慶：${festivals[key]}` : '';
}

updateClock();
setInterval(updateClock, 1000);