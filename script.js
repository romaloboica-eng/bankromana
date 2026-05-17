// ==========================================
// FinTech Pro - Основной JavaScript
// ==========================================

// --- Константы и курсы валют ---
const STORAGE_KEY = 'fintech_bank_data';
const CURRENT_USER_KEY = 'fintech_current_user';
const EXCHANGE_RATES = {
    RUB: { RUB: 1, USD: 0.011, EUR: 0.010 },
    USD: { RUB: 91.5, USD: 1, EUR: 0.92 },
    EUR: { RUB: 99.8, USD: 1.09, EUR: 1 }
};
const CURRENCY_SYMBOLS = { RUB: '₽', USD: '$', EUR: '€' };

// --- Генераторы ---
function generateAccountNumber() {
    return '40817' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
}

function generateCardNumber() {
    return '4276' + Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
}

function formatCardNumber(num) {
    return num.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function numberToWords(amount) {
    if (!amount || amount <= 0) return '';
    const units = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    const thousands = ['тысяча', 'тысячи', 'тысяч'];
    
    function convert(num) {
        if (num === 0) return '';
        let result = '';
        if (num >= 100) { result += hundreds[Math.floor(num / 100)] + ' '; num %= 100; }
        if (num >= 20) { result += tens[Math.floor(num / 10)] + ' '; num %= 10; }
        else if (num >= 10) { result += teens[num - 10] + ' '; return result.trim(); }
        if (num > 0) result += units[num] + ' ';
        return result.trim();
    }
    
    if (amount >= 1000) {
        const thousandsPart = Math.floor(amount / 1000);
        const remainder = amount % 1000;
        let result = convert(thousandsPart) + ' ';
        const lastDigit = thousandsPart % 10;
        const lastTwo = thousandsPart % 100;
        if (lastTwo >= 10 && lastTwo <= 19) result += 'тысяч ';
        else if (lastDigit === 1) result += 'тысяча ';
        else if (lastDigit >= 2 && lastDigit <= 4) result += 'тысячи ';
        else result += 'тысяч ';
        if (remainder > 0) result += convert(remainder);
        return result.trim();
    }
    return convert(amount);
}

// --- Данные ---
function getAllData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { users: {} };
}

function saveAllData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUser(username) {
    localStorage.setItem(CURRENT_USER_KEY, username);
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUserData() {
    const username = getCurrentUser();
    if (!username) return null;
    const data = getAllData();
    return data.users[username] || null;
}

function updateCurrentUserData(userData) {
    const username = getCurrentUser();
    if (!username) return;
    const data = getAllData();
    data.users[username] = userData;
    saveAllData(data);
}

// --- Уведомления (тосты) ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Форматирование ---
function formatCurrency(amount, currency) {
    return `${amount.toLocaleString()} ${CURRENCY_SYMBOLS[currency] || currency}`;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// --- Конвертация валют ---
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    return Math.round(amount * EXCHANGE_RATES[fromCurrency][toCurrency] * 100) / 100;
}

// --- Навигация ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const page = btn.dataset.page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');
        if (page === 'dashboard') updateDashboard();
        if (page === 'accounts') updateAccountsPage();
        if (page === 'transfer') updateTransferPage();
        if (page === 'history') updateHistoryPage();
        if (page === 'savings') updateSavingsPage();
        if (page === 'settings') updateSettingsPage();
    });
});

// Быстрые действия
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (action === 'deposit') {
            document.querySelector('[data-page="transfer"]').classList.add('active');
            document.querySelector('[data-page="transfer"]').click();
            document.querySelector('[data-type="external"]').click();
        } else if (action === 'transfer') {
            document.querySelector('[data-page="transfer"]').classList.add('active');
            document.querySelector('[data-page="transfer"]').click();
        } else if (action === 'savings') {
            document.querySelector('[data-page="savings"]').classList.add('active');
            document.querySelector('[data-page="savings"]').click();
        }
    });
});

// --- Авторизация ---
// Табы
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
        document.getElementById('login-error').textContent = '';
        document.getElementById('reg-error').textContent = '';
    });
});

// Регистрация
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const birthdate = document.getElementById('reg-birthdate').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const pin = document.getElementById('reg-pin').value;
    const currency = document.getElementById('reg-currency').value;
    const regError = document.getElementById('reg-error');
    
    if (!fullname || !birthdate || !phone || !email || !username || !password || !pin) {
        regError.textContent = 'Заполните все поля';
        return;
    }
    if (password.length < 8) {
        regError.textContent = 'Пароль должен быть не менее 8 символов';
        return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        regError.textContent = 'PIN-код должен содержать ровно 4 цифры';
        return;
    }
    
    const data = getAllData();
    if (data.users[username]) {
        regError.textContent = 'Пользователь с таким логином уже существует';
        return;
    }
    
    const accountNumber = generateAccountNumber();
    data.users[username] = {
        fullname,
        birthdate,
        phone,
        email,
        username,
        password,
        pin,
        accounts: [
            {
                id: 'acc_' + Date.now(),
                number: accountNumber,
                type: 'Текущий',
                currency: currency,
                balance: 0,
                cardNumber: generateCardNumber(),
                cardExpiry: '12/28',
                cardCVV: String(Math.floor(Math.random() * 900) + 100),
                isBlocked: false,
                isSavings: false,
                savingsGoal: null,
                savingsDeadline: null,
                history: []
            }
        ],
        templates: [],
        notifications: { login: true, transfer: true },
        created: new Date().toISOString()
    };
    saveAllData(data);
    setCurrentUser(username);
    showToast('Счёт успешно создан! Добро пожаловать в FinTech Pro', 'success');
    showBankScreen();
});

// Вход
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');
    
    const data = getAllData();
    
    // Поиск по логину или номеру счёта
    let foundUser = null;
    if (data.users[username]) {
        foundUser = username;
    } else {
        for (const [uname, udata] of Object.entries(data.users)) {
            if (udata.accounts.some(acc => acc.number === username)) {
                foundUser = uname;
                break;
            }
        }
    }
    
    if (!foundUser) {
        loginError.textContent = 'Пользователь не найден';
        return;
    }
    if (data.users[foundUser].password !== password) {
        loginError.textContent = 'Неверный пароль';
        return;
    }
    
    setCurrentUser(foundUser);
    if (data.users[foundUser].notifications.login) {
        showToast(`Вход в систему: ${data.users[foundUser].fullname}`, 'info');
    }
    showBankScreen();
});

// Выход
document.getElementById('logout-btn').addEventListener('click', () => {
    clearCurrentUser();
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('bank-screen').classList.remove('active');
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('login-form').classList.add('active');
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="login"]').classList.add('active');
});

function showBankScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('bank-screen').classList.add('active');
    document.getElementById('sidebar-username').textContent = getCurrentUserData()?.fullname || '';
    updateDashboard();
}

// --- Дашборд ---
function updateDashboard() {
    const user = getCurrentUserData();
    if (!user) return;
    
    // Общий баланс в основной валюте
    const mainCurrency = user.accounts[0]?.currency || 'RUB';
    let totalBalance = 0;
    user.accounts.forEach(acc => {
        totalBalance += convertCurrency(acc.balance, acc.currency, mainCurrency);
    });
    
    document.getElementById('total-balance').textContent = formatCurrency(Math.round(totalBalance), mainCurrency);
    
    // Эквивалент в других валютах
    const equivs = [];
    if (mainCurrency !== 'USD') equivs.push(formatCurrency(convertCurrency(totalBalance, mainCurrency, 'USD'), 'USD'));
    if (mainCurrency !== 'EUR') equivs.push(formatCurrency(convertCurrency(totalBalance, mainCurrency, 'EUR'), 'EUR'));
    document.getElementById('balance-equivalent').textContent = '≈ ' + equivs.join(' | ');
    
    // Дата и время
    document.getElementById('current-datetime').textContent = new Date().toLocaleString('ru-RU');
    
    // Мини-счета
    const accountsMini = document.getElementById('accounts-mini');
    accountsMini.innerHTML = user.accounts.map(acc => `
        <div class="account-card ${acc.isBlocked ? 'blocked' : ''}">
            <span class="card-badge ${acc.isBlocked ? 'badge-blocked' : acc.isSavings ? 'badge-savings' : 'badge-active'}">${acc.isBlocked ? 'Заблокирована' : acc.isSavings ? 'Накопительный' : 'Активен'}</span>
            <div class="account-type">${acc.type}</div>
            <div class="account-number">${acc.number}</div>
            <div class="account-balance">${formatCurrency(acc.balance, acc.currency)}</div>
            <div class="account-currency">Карта: ${formatCardNumber(acc.cardNumber)}</div>
        </div>
    `).join('');
    
    // Последние операции
    const allHistory = [];
    user.accounts.forEach(acc => {
        acc.history.forEach(h => allHistory.push({ ...h, accountNumber: acc.number, accountCurrency: acc.currency }));
    });
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    document.getElementById('recent-transactions').innerHTML = allHistory.slice(0, 5).map(h => `
        <div class="transaction-item ${h.type}">
            <div class="tx-info">
                <div class="tx-desc">${h.description}</div>
                <div class="tx-date">${formatDate(h.date)} • ${h.accountNumber.slice(-4)}</div>
            </div>
            <div class="tx-amount ${h.type}">${h.type === 'income' ? '+' : '-'}${formatCurrency(h.amount, h.accountCurrency)}</div>
        </div>
    `).join('') || '<p style="color: var(--text-muted); padding: 10px;">Операций пока нет</p>';
    
    // Статистика за месяц (упрощённая)
    updateStatsBar(user);
}

function updateStatsBar(user) {
    const statsBar = document.getElementById('stats-bar');
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyExpenses = new Array(daysInMonth).fill(0);
    
    user.accounts.forEach(acc => {
        acc.history.forEach(h => {
            if (h.type === 'expense') {
                const d = new Date(h.date);
                if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                    dailyExpenses[d.getDate() - 1] += convertCurrency(h.amount, acc.currency, 'RUB');
                }
            }
        });
    });
    
    const maxExpense = Math.max(...dailyExpenses, 1);
    statsBar.innerHTML = dailyExpenses.map((val, i) => `
        <div class="stat-column">
            <div class="stat-fill" style="height: ${(val / maxExpense) * 80}px;" title="День ${i+1}: ${Math.round(val)} ₽"></div>
            <div class="stat-label">${i+1}</div>
        </div>
    `).join('');
}

// --- Страница счетов ---
function updateAccountsPage() {
    const user = getCurrentUserData();
    if (!user) return;
    
    document.getElementById('accounts-detailed').innerHTML = user.accounts.map(acc => `
        <div class="account-card ${acc.isBlocked ? 'blocked' : ''}" style="margin-bottom: 14px;">
            <span class="card-badge ${acc.isBlocked ? 'badge-blocked' : acc.isSavings ? 'badge-savings' : 'badge-active'}">${acc.isBlocked ? 'Заблокирована' : acc.isSavings ? 'Накопительный' : 'Активен'}</span>
            <div class="account-type">${acc.type} счёт</div>
            <div class="account-number">Счёт: ${acc.number}</div>
            <div class="account-number">Карта: ${formatCardNumber(acc.cardNumber)}</div>
            <div style="margin-top: 4px; font-size: 12px; color: var(--text-muted);">Срок: ${acc.cardExpiry} | CVV: ${acc.cardCVV}</div>
            <div class="account-balance" style="margin-top: 10px;">${formatCurrency(acc.balance, acc.currency)}</div>
            <div class="account-actions">
                <button onclick="toggleBlockAccount('${acc.id}')">${acc.isBlocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}</button>
                <button onclick="addAccount()">+ Новый счёт</button>
            </div>
        </div>
    `).join('');
}

// Блокировка/разблокировка счёта
function toggleBlockAccount(accountId) {
    const user = getCurrentUserData();
    if (!user) return;
    const acc = user.accounts.find(a => a.id === accountId);
    if (!acc) return;
    
    const pin = prompt('Введите PIN-код для подтверждения:');
    if (pin !== user.pin) {
        showToast('Неверный PIN-код', 'error');
        return;
    }
    
    acc.isBlocked = !acc.isBlocked;
    updateCurrentUserData(user);
    showToast(acc.isBlocked ? 'Счёт заблокирован' : 'Счёт разблокирован', 'success');
    updateAccountsPage();
    updateDashboard();
}

// Добавление нового счёта
function addAccount() {
    const user = getCurrentUserData();
    if (!user) return;
    
    const currency = prompt('Выберите валюту (RUB, USD, EUR):', 'RUB')?.toUpperCase();
    if (!['RUB', 'USD', 'EUR'].includes(currency)) {
        showToast('Неверная валюта', 'error');
        return;
    }
    
    const type = confirm('Сделать накопительным счётом?') ? 'Накопительный' : 'Текущий';
    
    user.accounts.push({
        id: 'acc_' + Date.now(),
        number: generateAccountNumber(),
        type: type,
        currency: currency,
        balance: 0,
        cardNumber: generateCardNumber(),
        cardExpiry: '12/' + (new Date().getFullYear() + 3).toString().slice(-2),
        cardCVV: String(Math.floor(Math.random() * 900) + 100),
        isBlocked: false,
        isSavings: type === 'Накопительный',
        savingsGoal: null,
        savingsDeadline: null,
        history: []
    });
    updateCurrentUserData(user);
    showToast('Новый счёт создан!', 'success');
    updateAccountsPage();
    updateDashboard();
}

document.getElementById('add-account-btn')?.addEventListener('click', addAccount);

// --- Страница переводов ---
function updateTransferPage() {
    const user = getCurrentUserData();
    if (!user) return;
    
    // Заполняем выпадающие списки счетов
    const selectIds = ['tf-from-account', 'ext-from-account', 'btw-from-account', 'btw-to-account'];
    selectIds.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = user.accounts
                .filter(a => !a.isBlocked && (id !== 'btw-to-account' ? true : true))
                .map(a => `<option value="${a.id}">${a.number.slice(-6)} (${formatCurrency(a.balance, a.currency)})</option>`)
                .join('');
        }
    });
    
    // Шаблоны
    document.getElementById('templates-list').innerHTML = (user.templates || []).map((t, i) => `
        <div class="template-item">
            <span>${t.name} — ${t.toUser} (${formatCurrency(t.amount, t.currency)})</span>
            <span class="use-template" onclick="useTemplate(${i})">Использовать</span>
        </div>
    `).join('') || '<p style="color: var(--text-muted); font-size: 13px;">Нет сохранённых шаблонов</p>';
}

// Табы переводов
document.querySelectorAll('.transfer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.transfer-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.transfer-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`transfer-${tab.dataset.type}`).classList.add('active');
        updateTransferPage();
    });
});

// Поиск получателя для внутреннего перевода
document.getElementById('tf-to-user')?.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    const preview = document.getElementById('tf-recipient-preview');
    if (!query || query.length < 2) {
        preview.classList.remove('show');
        return;
    }
    
    const data = getAllData();
    const currentUser = getCurrentUser();
    let found = null;
    
    for (const [uname, udata] of Object.entries(data.users)) {
        if (uname === currentUser) continue;
        if (uname.includes(query) || udata.accounts.some(a => a.number.includes(query))) {
            found = udata;
            break;
        }
    }
    
    if (found) {
        preview.classList.add('show');
        preview.innerHTML = `<strong>${found.fullname}</strong><br><small>Счетов: ${found.accounts.length}</small>`;
    } else {
        preview.classList.remove('show');
    }
});

// Внутренний перевод
document.getElementById('transfer-submit-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    const fromAccountId = document.getElementById('tf-from-account').value;
    const toUserQuery = document.getElementById('tf-to-user').value.trim().toLowerCase();
    const amount = parseInt(document.getElementById('tf-amount').value);
    const comment = document.getElementById('tf-comment').value.trim();
    const pin = document.getElementById('tf-pin').value;
    const errorEl = document.getElementById('tf-error');
    
    errorEl.textContent = '';
    
    if (!toUserQuery || !amount || amount <= 0) {
        errorEl.textContent = 'Заполните все обязательные поля';
        return;
    }
    if (pin !== user.pin) {
        errorEl.textContent = 'Неверный PIN-код';
        return;
    }
    
    const fromAcc = user.accounts.find(a => a.id === fromAccountId);
    if (!fromAcc || fromAcc.isBlocked) {
        errorEl.textContent = 'Счёт недоступен';
        return;
    }
    if (fromAcc.balance < amount) {
        errorEl.textContent = 'Недостаточно средств';
        return;
    }
    
    // Ищем получателя
    const data = getAllData();
    let toUser = null;
    let toUsername = null;
    
    for (const [uname, udata] of Object.entries(data.users)) {
        if (uname === user.username) continue;
        if (uname === toUserQuery || udata.accounts.some(a => a.number === toUserQuery)) {
            toUser = udata;
            toUsername = uname;
            break;
        }
    }
    
    if (!toUser) {
        errorEl.textContent = 'Получатель не найден';
        return;
    }
    
    // Находим первый активный счёт получателя в той же валюте или конвертируем
    let toAcc = toUser.accounts.find(a => !a.isBlocked && a.currency === fromAcc.currency);
    if (!toAcc) {
        toAcc = toUser.accounts.find(a => !a.isBlocked);
    }
    if (!toAcc) {
        errorEl.textContent = 'У получателя нет доступных счетов';
        return;
    }
    
    const convertedAmount = convertCurrency(amount, fromAcc.currency, toAcc.currency);
    
    // Списываем
    fromAcc.balance -= amount;
    fromAcc.history.unshift({
        type: 'expense',
        description: `Перевод: ${toUser.fullname}${comment ? ' (' + comment + ')' : ''}`,
        amount: amount,
        date: new Date().toISOString()
    });
    
    // Зачисляем
    toAcc.balance += convertedAmount;
    toAcc.history.unshift({
        type: 'income',
        description: `Перевод от: ${user.fullname}${comment ? ' (' + comment + ')' : ''}`,
        amount: convertedAmount,
        date: new Date().toISOString()
    });
    
    data.users[user.username] = user;
    data.users[toUsername] = toUser;
    saveAllData(data);
    
    // Сохраняем шаблон если спросят
    if (confirm('Сохранить как шаблон для будущих переводов?')) {
        user.templates = user.templates || [];
        user.templates.push({
            name: `Перевод для ${toUser.fullname}`,
            toUser: toUserQuery,
            amount: amount,
            currency: fromAcc.currency,
            comment: comment
        });
        updateCurrentUserData(user);
    }
    
    document.getElementById('tf-to-user').value = '';
    document.getElementById('tf-amount').value = '';
    document.getElementById('tf-comment').value = '';
    document.getElementById('tf-pin').value = '';
    
    if (user.notifications.transfer) {
        showToast(`Перевод выполнен: ${formatCurrency(amount, fromAcc.currency)} → ${toUser.fullname}`, 'success');
    }
    updateDashboard();
    updateTransferPage();
});

// Внешний перевод (пополнение)
document.getElementById('ext-submit-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    const fromAccountId = document.getElementById('ext-from-account').value;
    const bik = document.getElementById('ext-bik').value.trim();
    const extAccount = document.getElementById('ext-account').value.trim();
    const extName = document.getElementById('ext-name').value.trim();
    const amount = parseInt(document.getElementById('ext-amount').value);
    const pin = document.getElementById('ext-pin').value;
    const errorEl = document.getElementById('ext-error');
    
    errorEl.textContent = '';
    
    if (!bik || !extAccount || !extName || !amount || amount <= 0) {
        errorEl.textContent = 'Заполните все поля';
        return;
    }
    if (pin !== user.pin) {
        errorEl.textContent = 'Неверный PIN-код';
        return;
    }
    
    // Для внешнего перевода — пополняем (симуляция)
    const acc = user.accounts.find(a => a.id === fromAccountId);
    if (!acc || acc.isBlocked) {
        errorEl.textContent = 'Счёт недоступен';
        return;
    }
    
    if (confirm(`Подтвердите внешний перевод:\n${formatCurrency(amount, acc.currency)} на счёт ${extAccount}\nПолучатель: ${extName}\nБИК: ${bik}`)) {
        acc.balance += amount;
        acc.history.unshift({
            type: 'income',
            description: `Внешнее пополнение от: ${extName} (БИК: ${bik})`,
            amount: amount,
            date: new Date().toISOString()
        });
        updateCurrentUserData(user);
        
        document.getElementById('ext-bik').value = '';
        document.getElementById('ext-account').value = '';
        document.getElementById('ext-name').value = '';
        document.getElementById('ext-amount').value = '';
        document.getElementById('ext-pin').value = '';
        
        showToast(`Счёт пополнен на ${formatCurrency(amount, acc.currency)}`, 'success');
        updateDashboard();
        updateTransferPage();
    }
});

// Перевод между своими счетами
document.getElementById('btw-submit-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    const fromId = document.getElementById('btw-from-account').value;
    const toId = document.getElementById('btw-to-account').value;
    const amount = parseInt(document.getElementById('btw-amount').value);
    const pin = document.getElementById('btw-pin').value;
    const errorEl = document.getElementById('btw-error');
    
    errorEl.textContent = '';
    
    if (fromId === toId) {
        errorEl.textContent = 'Выберите разные счета';
        return;
    }
    if (!amount || amount <= 0) {
        errorEl.textContent = 'Введите сумму';
        return;
    }
    if (pin !== user.pin) {
        errorEl.textContent = 'Неверный PIN-код';
        return;
    }
    
    const fromAcc = user.accounts.find(a => a.id === fromId);
    const toAcc = user.accounts.find(a => a.id === toId);
    
    if (fromAcc.isBlocked || toAcc.isBlocked) {
        errorEl.textContent = 'Один из счетов заблокирован';
        return;
    }
    if (fromAcc.balance < amount) {
        errorEl.textContent = 'Недостаточно средств';
        return;
    }
    
    const convertedAmount = convertCurrency(amount, fromAcc.currency, toAcc.currency);
    
    fromAcc.balance -= amount;
    fromAcc.history.unshift({
        type: 'expense',
        description: `Перевод на свой счёт ${toAcc.number.slice(-6)}`,
        amount: amount,
        date: new Date().toISOString()
    });
    
    toAcc.balance += convertedAmount;
    toAcc.history.unshift({
        type: 'income',
        description: `Перевод со своего счёта ${fromAcc.number.slice(-6)}`,
        amount: convertedAmount,
        date: new Date().toISOString()
    });
    
    updateCurrentUserData(user);
    document.getElementById('btw-amount').value = '';
    document.getElementById('btw-pin').value = '';
    
    showToast(`Переведено ${formatCurrency(amount, fromAcc.currency)} между счетами`, 'success');
    updateDashboard();
    updateTransferPage();
});

// Шаблоны
function useTemplate(index) {
    const user = getCurrentUserData();
    if (!user || !user.templates || !user.templates[index]) return;
    
    const t = user.templates[index];
    document.querySelector('[data-type="internal"]').click();
    document.getElementById('tf-to-user').value = t.toUser;
    document.getElementById('tf-amount').value = t.amount;
    document.getElementById('tf-comment').value = t.comment || '';
    
    // Выбираем счёт с нужной валютой
    const select = document.getElementById('tf-from-account');
    for (let opt of select.options) {
        if (opt.text.includes(CURRENCY_SYMBOLS[t.currency])) {
            opt.selected = true;
            break;
        }
    }
    showToast('Шаблон применён', 'info');
}

// --- История ---
function updateHistoryPage() {
    const user = getCurrentUserData();
    if (!user) return;
    
    // Заполняем фильтр счетов
    const filterAccount = document.getElementById('filter-account');
    filterAccount.innerHTML = '<option value="all">Все счета</option>' +
        user.accounts.map(a => `<option value="${a.id}">${a.number.slice(-6)} (${a.currency})</option>`).join('');
    
    applyHistoryFilters();
}

function applyHistoryFilters() {
    const user = getCurrentUserData();
    if (!user) return;
    
    const filterAccount = document.getElementById('filter-account').value;
    const filterType = document.getElementById('filter-type').value;
    const filterDateFrom = document.getElementById('filter-date-from').value;
    const filterDateTo = document.getElementById('filter-date-to').value;
    const filterSearch = document.getElementById('filter-search').value.toLowerCase();
    
    let allHistory = [];
    user.accounts.forEach(acc => {
        if (filterAccount !== 'all' && acc.id !== filterAccount) return;
        acc.history.forEach(h => {
            allHistory.push({ ...h, accountNumber: acc.number, accountCurrency: acc.currency });
        });
    });
    
    // Фильтры
    if (filterType !== 'all') {
        allHistory = allHistory.filter(h => h.type === filterType);
    }
    if (filterDateFrom) {
        allHistory = allHistory.filter(h => new Date(h.date) >= new Date(filterDateFrom));
    }
    if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59);
        allHistory = allHistory.filter(h => new Date(h.date) <= toDate);
    }
    if (filterSearch) {
        allHistory = allHistory.filter(h => h.description.toLowerCase().includes(filterSearch));
    }
    
    allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    document.getElementById('full-history').innerHTML = allHistory.map(h => `
        <div class="transaction-item ${h.type}">
            <div class="tx-info">
                <div class="tx-desc">${h.description}</div>
                <div class="tx-date">${formatDate(h.date)} • Счёт: ${h.accountNumber.slice(-6)}</div>
            </div>
            <div class="tx-amount ${h.type}">${h.type === 'income' ? '+' : '-'}${formatCurrency(h.amount, h.accountCurrency)}</div>
        </div>
    `).join('') || '<p style="color: var(--text-muted); padding: 20px; text-align: center;">Операций не найдено</p>';
}

document.getElementById('filter-account')?.addEventListener('change', applyHistoryFilters);
document.getElementById('filter-type')?.addEventListener('change', applyHistoryFilters);
document.getElementById('filter-date-from')?.addEventListener('change', applyHistoryFilters);
document.getElementById('filter-date-to')?.addEventListener('change', applyHistoryFilters);
document.getElementById('filter-search')?.addEventListener('input', applyHistoryFilters);

// Экспорт выписки
document.getElementById('export-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    let text = `Выписка по счетам | FinTech Pro\n`;
    text += `Клиент: ${user.fullname}\n`;
    text += `Дата формирования: ${new Date().toLocaleString('ru-RU')}\n`;
    text += `=`.repeat(50) + `\n\n`;
    
    user.accounts.forEach(acc => {
        text += `Счёт: ${acc.number} | ${acc.type} | Баланс: ${formatCurrency(acc.balance, acc.currency)}\n`;
        text += `-`.repeat(40) + `\n`;
        acc.history.slice(0, 50).forEach(h => {
            const sign = h.type === 'income' ? '+' : '-';
            text += `${formatDate(h.date)} | ${sign}${formatCurrency(h.amount, acc.currency)} | ${h.description}\n`;
        });
        text += `\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Выписка_${user.username}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Выписка сохранена', 'success');
});

// --- Накопления ---
function updateSavingsPage() {
    const user = getCurrentUserData();
    if (!user) return;
    
    const savingsAccs = user.accounts.filter(a => a.isSavings);
    
    document.getElementById('savings-accounts').innerHTML = savingsAccs.map(acc => {
        const percent = acc.savingsGoal ? Math.min(100, Math.round((acc.balance / acc.savingsGoal) * 100)) : 0;
        return `
            <div class="saving-card">
                <h4>${acc.type} • ${formatCurrency(acc.balance, acc.currency)}</h4>
                ${acc.savingsGoal ? `
                    <div class="saving-progress">
                        <span style="font-size:13px; color: var(--text-secondary);">Цель: ${formatCurrency(acc.savingsGoal, acc.currency)} (${percent}%)</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                ` : '<p style="font-size:13px; color: var(--text-muted);">Цель не задана</p>'}
                <div class="saving-stats">
                    <span>Счёт: ${acc.number.slice(-6)}</span>
                    <span>Ставка: 5% годовых</span>
                </div>
                <button class="btn-outline" onclick="depositToSavings('${acc.id}')">Пополнить</button>
            </div>
        `;
    }).join('') || '<p style="color: var(--text-muted);">Нет накопительных счетов</p>';
}

function depositToSavings(accountId) {
    const user = getCurrentUserData();
    if (!user) return;
    const acc = user.accounts.find(a => a.id === accountId);
    if (!acc) return;
    
    const amount = parseInt(prompt(`Введите сумму пополнения (${acc.currency}):`, '1000'));
    if (!amount || amount <= 0) return;
    
    // Ищем счёт списания (первый активный с достаточным балансом)
    const sourceAcc = user.accounts.find(a => !a.isBlocked && a.id !== accountId && a.balance >= amount);
    if (!sourceAcc) {
        showToast('Нет доступного счёта для списания', 'error');
        return;
    }
    
    const pin = prompt('PIN-код:');
    if (pin !== user.pin) {
        showToast('Неверный PIN-код', 'error');
        return;
    }
    
    const converted = convertCurrency(amount, sourceAcc.currency, acc.currency);
    sourceAcc.balance -= amount;
    sourceAcc.history.unshift({
        type: 'expense',
        description: `Пополнение накопительного счёта ${acc.number.slice(-6)}`,
        amount: amount,
        date: new Date().toISOString()
    });
    
    acc.balance += converted;
    acc.history.unshift({
        type: 'income',
        description: `Пополнение со счёта ${sourceAcc.number.slice(-6)}`,
        amount: converted,
        date: new Date().toISOString()
    });
    
    updateCurrentUserData(user);
    showToast(`Накопительный счёт пополнен на ${formatCurrency(converted, acc.currency)}`, 'success');
    updateSavingsPage();
    updateDashboard();
}

document.getElementById('create-saving-btn')?.addEventListener('click', () => {
    document.getElementById('saving-modal').classList.add('show');
});

document.getElementById('saving-cancel')?.addEventListener('click', () => {
    document.getElementById('saving-modal').classList.remove('show');
});

document.getElementById('saving-create')?.addEventListener('click', () => {
    const name = document.getElementById('saving-name').value.trim();
    const target = parseInt(document.getElementById('saving-target').value);
    const currency = document.getElementById('saving-currency').value;
    
    if (!name || !target || target <= 0) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    const user = getCurrentUserData();
    if (!user) return;
    
    user.accounts.push({
        id: 'acc_' + Date.now(),
        number: generateAccountNumber(),
        type: name,
        currency: currency,
        balance: 0,
        cardNumber: generateCardNumber(),
        cardExpiry: '12/' + (new Date().getFullYear() + 3).toString().slice(-2),
        cardCVV: String(Math.floor(Math.random() * 900) + 100),
        isBlocked: false,
        isSavings: true,
        savingsGoal: target,
        savingsDeadline: null,
        history: []
    });
    
    updateCurrentUserData(user);
    document.getElementById('saving-modal').classList.remove('show');
    document.getElementById('saving-name').value = '';
    document.getElementById('saving-target').value = '';
    showToast('Цель накопления создана!', 'success');
    updateSavingsPage();
    updateDashboard();
});

// --- Настройки ---
function updateSettingsPage() {
    const user = getCurrentUserData();
    if (!user) return;
    
    document.getElementById('set-fullname').textContent = user.fullname;
    document.getElementById('set-username').textContent = user.username;
    document.getElementById('set-email').textContent = user.email;
    document.getElementById('set-phone').textContent = user.phone;
    
    document.getElementById('notify-login').checked = user.notifications?.login ?? true;
    document.getElementById('notify-transfer').checked = user.notifications?.transfer ?? true;
}

document.getElementById('change-pin-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    const oldPin = prompt('Текущий PIN-код:');
    if (oldPin !== user.pin) {
        showToast('Неверный PIN-код', 'error');
        return;
    }
    
    const newPin = prompt('Новый PIN-код (4 цифры):');
    if (!newPin || !/^\d{4}$/.test(newPin)) {
        showToast('PIN должен содержать 4 цифры', 'error');
        return;
    }
    
    user.pin = newPin;
    updateCurrentUserData(user);
    showToast('PIN-код изменён', 'success');
});

document.getElementById('change-password-btn')?.addEventListener('click', () => {
    const user = getCurrentUserData();
    if (!user) return;
    
    const oldPass = prompt('Текущий пароль:');
    if (oldPass !== user.password) {
        showToast('Неверный пароль', 'error');
        return;
    }
    
    const newPass = prompt('Новый пароль (мин. 8 символов):');
    if (!newPass || newPass.length < 8) {
        showToast('Пароль должен быть не менее 8 символов', 'error');
        return;
    }
    
    user.password = newPass;
    updateCurrentUserData(user);
    showToast('Пароль изменён', 'success');
});

document.getElementById('notify-login')?.addEventListener('change', function() {
    const user = getCurrentUserData();
    if (!user) return;
    user.notifications = user.notifications || {};
    user.notifications.login = this.checked;
    updateCurrentUserData(user);
});

document.getElementById('notify-transfer')?.addEventListener('change', function() {
    const user = getCurrentUserData();
    if (!user) return;
    user.notifications = user.notifications || {};
    user.notifications.transfer = this.checked;
    updateCurrentUserData(user);
});

// --- Сумма прописью (для переводов) ---
document.getElementById('tf-amount')?.addEventListener('input', function() {
    const amount = parseInt(this.value);
    const wordsEl = document.getElementById('tf-amount-words');
    if (amount && amount > 0) {
        const user = getCurrentUserData();
        const currency = user?.accounts[0]?.currency || 'RUB';
        const currencyNames = { RUB: 'рублей', USD: 'долларов', EUR: 'евро' };
        wordsEl.textContent = `${numberToWords(amount)} ${currencyNames[currency] || ''}`;
    } else {
        wordsEl.textContent = '';
    }
});

// --- Обновление даты и времени каждую минуту ---
setInterval(() => {
    const dt = document.getElementById('current-datetime');
    if (dt && document.getElementById('page-dashboard')?.classList.contains('active')) {
        dt.textContent = new Date().toLocaleString('ru-RU');
    }
}, 60000);

// --- Автовход ---
if (getCurrentUser() && getAllData().users[getCurrentUser()]) {
    showBankScreen();
}

// --- Глобальные функции для onclick ---
window.toggleBlockAccount = toggleBlockAccount;
window.addAccount = addAccount;
window.useTemplate = useTemplate;
window.depositToSavings = depositToSavings;

console.log('🏦 FinTech Pro Bank готов к работе');