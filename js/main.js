// Основной JavaScript файл для системы управления сервисным центром ООО "ЧИП"

// Конфигурация приложения
const AppConfig = {
    appName: "ЧИП: ServiceTrack",
    version: "1.0.0",
    apiUrl: "/api", // Базовый URL для API
    mockData: true, // Использовать моковые данные
    localStorageKey: "chip_service_system"
};

// Глобальное состояние приложения
const AppState = {
    currentUser: null,
    notifications: [],
    orders: [],
    clients: [],
    employees: [],
    services: [],
    spareParts: [],
    isLoading: false,
    currentPage: 'dashboard'
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    updateUI();
});

// Инициализация приложения
function initializeApp() {
    console.log(`${AppConfig.appName} v${AppConfig.version} инициализирован`);
    
    // Проверка авторизации (в демо-режиме всегда авторизован)
    checkAuth();
    
    // Инициализация бокового меню
    initSidebar();
    
    // Инициализация модальных окон
    initModals();
    
    // Установка текущей даты в футере
    setCurrentDate();
    
    // Загрузка уведомлений
    loadNotifications();
}

// Проверка авторизации
function checkAuth() {
    const userData = localStorage.getItem(`${AppConfig.localStorageKey}_user`);
    
    if (userData) {
        AppState.currentUser = JSON.parse(userData);
    } else {
        // Демо-пользователь
        AppState.currentUser = {
            id: 1,
            name: "Иван Петров",
            role: "admin",
            avatar: "ИП",
            email: "admin@chip-service.ru",
            phone: "+7 (999) 123-45-67",
            department: "Администрация"
        };
        localStorage.setItem(`${AppConfig.localStorageKey}_user`, JSON.stringify(AppState.currentUser));
    }
    
    // Обновляем информацию о пользователе в интерфейсе
    updateUserInfo();
}

// Инициализация бокового меню
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Закрытие меню при клике вне его на мобильных устройствах
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 991 && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Подсветка активного пункта меню
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Инициализация модальных окон
function initModals() {
    // Обработка открытия модальных окон
    document.querySelectorAll('[data-modal-toggle]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-toggle');
            openModal(modalId);
        });
    });
    
    // Обработка закрытия модальных окон
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });
    
    // Закрытие модальных окон при клике вне контента
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Закрытие модальных окон по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

// Открытие модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Глобальный поиск
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    }
    
    // Кнопка уведомлений
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function() {
            openModal('notificationsModal');
        });
    }
    
    // Кнопка создания заказа
    const createOrderBtn = document.getElementById('createOrderBtn');
    if (createOrderBtn) {
        createOrderBtn.addEventListener('click', function() {
            openModal('createOrderModal');
            loadCreateOrderForm();
        });
    }
    
    // Обработка форм
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Загрузка начальных данных
function loadInitialData() {
    if (AppConfig.mockData) {
        loadMockData();
    } else {
        // Здесь будет загрузка данных с сервера
        fetchDataFromServer();
    }
}

// Загрузка моковых данных
function loadMockData() {
    // Моковые данные заказов
    AppState.orders = [
        {
            id: 1057,
            clientId: 1,
            clientName: "Александр Иванов",
            device: "Ноутбук ASUS X543",
            deviceType: "Ноутбук",
            issue: "Не включается, возможно проблема с питанием",
            status: "ready",
            masterId: 1,
            masterName: "Петр Сидоров",
            receivedDate: "24.12.2025",
            completionDate: "26.12.2025",
            workCost: 2500,
            partsCost: 1800,
            totalCost: 4300,
            urgency: "normal",
            notes: "Клиент просил сделать срочно"
        },
        {
            id: 1056,
            clientId: 2,
            clientName: "Мария Петрова",
            device: "Принтер HP LaserJet",
            deviceType: "Принтер",
            issue: "Зажевывает бумагу, требуется чистка",
            status: "in_progress",
            masterId: 2,
            masterName: "Иван Козлов",
            receivedDate: "23.12.2025",
            completionDate: null,
            workCost: 1200,
            partsCost: 500,
            totalCost: 1700,
            urgency: "normal",
            notes: ""
        },
        {
            id: 1055,
            clientId: 3,
            clientName: "Сергей Смирнов",
            device: "ПК (сборка)",
            deviceType: "Системный блок",
            issue: "Требуется замена видеокарты",
            status: "diagnostic",
            masterId: 3,
            masterName: "Алексей Волков",
            receivedDate: "23.12.2025",
            completionDate: null,
            workCost: 0,
            partsCost: 0,
            totalCost: 0,
            urgency: "high",
            notes: "Срочный заказ"
        }
    ];
    
    // Моковые данные клиентов
    AppState.clients = [
        { id: 1, name: "Александр Иванов", phone: "+7 (999) 111-22-33", email: "a.ivanov@mail.ru", ordersCount: 5 },
        { id: 2, name: "Мария Петрова", phone: "+7 (999) 222-33-44", email: "m.petrova@gmail.com", ordersCount: 3 },
        { id: 3, name: "Сергей Смирнов", phone: "+7 (999) 333-44-55", email: "", ordersCount: 2 }
    ];
    
    // Моковые данные сотрудников
    AppState.employees = [
        { id: 1, name: "Петр Сидоров", role: "master", specialization: "Ноутбуки и ПК", rate: 30, activeOrders: 3 },
        { id: 2, name: "Иван Козлов", role: "master", specialization: "Принтеры и МФУ", rate: 25, activeOrders: 2 },
        { id: 3, name: "Алексей Волков", role: "master", specialization: "Компьютерная периферия", rate: 28, activeOrders: 4 }
    ];
    
    // Моковые данные услуг
    AppState.services = [
        { id: 1, name: "Диагностика", price: 500, category: "diagnostic" },
        { id: 2, name: "Чистка от пыли", price: 1200, category: "maintenance" },
        { id: 3, name: "Замена термопасты", price: 800, category: "maintenance" },
        { id: 4, name: "Установка ОС", price: 1500, category: "software" }
    ];
    
    // Моковые данные запчастей
    AppState.spareParts = [
        { id: 1, name: "Оперативная память DDR4 8GB", code: "RAM-8G-D4", price: 2500, stock: 12 },
        { id: 2, name: "SSD накопитель 240GB", code: "SSD-240", price: 1800, stock: 8 },
        { id: 3, name: "Картридж для HP LJ 107A", code: "HP-107A", price: 1200, stock: 15 }
    ];
    
    console.log('Моковые данные загружены');
}

// Загрузка данных с сервера
async function fetchDataFromServer() {
    try {
        AppState.isLoading = true;
        showLoading();
        
        // Здесь будут реальные запросы к API
        // const response = await fetch(`${AppConfig.apiUrl}/orders`);
        // AppState.orders = await response.json();
        
        AppState.isLoading = false;
        hideLoading();
        updateUI();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        AppState.isLoading = false;
        hideLoading();
        showError('Не удалось загрузить данные');
    }
}

// Загрузка уведомлений
function loadNotifications() {
    AppState.notifications = [
        {
            id: 1,
            title: "Заказ #1057 готов к выдаче",
            text: "Ноутбук ASUS X543 отремонтирован",
            time: "10:30",
            read: false,
            type: "order_ready"
        },
        {
            id: 2,
            title: "Новый заказ #1058",
            text: "Принят новый заказ на ремонт МФУ",
            time: "09:15",
            read: false,
            type: "new_order"
        },
        {
            id: 3,
            title: "Заканчивается запчасть",
            text: "Осталось 3 картриджа HP-107A",
            time: "Вчера",
            read: true,
            type: "low_stock"
        }
    ];
    
    updateNotificationsBadge();
    renderNotificationsList();
}

// Обновление счетчика уведомлений
function updateNotificationsBadge() {
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge .badge');
    
    if (badge) {
        badge.textContent = unreadCount;
        if (unreadCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}

// Отображение списка уведомлений
function renderNotificationsList() {
    const container = document.querySelector('.notifications-list');
    if (!container) return;
    
    container.innerHTML = AppState.notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-text">${notification.text}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `).join('');
    
    // Обработка кликов по уведомлениям
    container.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const notificationId = parseInt(this.getAttribute('data-id'));
            markNotificationAsRead(notificationId);
        });
    });
}

// Пометить уведомление как прочитанное
function markNotificationAsRead(notificationId) {
    const notification = AppState.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        updateNotificationsBadge();
        renderNotificationsList();
    }
}

// Обновление информации о пользователе
function updateUserInfo() {
    const user = AppState.currentUser;
    if (!user) return;
    
    // Обновляем аватар
    const avatar = document.querySelector('.user-avatar');
    if (avatar) {
        avatar.textContent = user.avatar || user.name.charAt(0);
    }
    
    // Обновляем имя
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = user.name;
    }
    
    // Обновляем роль
    const userRole = document.querySelector('.user-role');
    if (userRole) {
        userRole.textContent = getRoleName(user.role);
    }
}

// Получение названия роли
function getRoleName(role) {
    const roles = {
        'admin': 'Администратор',
        'master': 'Мастер',
        'accountant': 'Бухгалтер',
        'manager': 'Менеджер'
    };
    return roles[role] || role;
}

// Выполнение поиска
function performSearch(query) {
    if (!query.trim()) return;
    
    console.log('Поиск:', query);
    
    // Здесь будет логика поиска
    // В демо-режиме просто показываем сообщение
    showAlert(`Результаты поиска для: "${query}"`, 'info');
}

// Обработка отправки форм
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formId = form.id;
    
    switch (formId) {
        case 'createOrderForm':
            handleCreateOrder(form);
            break;
        case 'loginForm':
            handleLogin(form);
            break;
        default:
            console.log('Форма отправлена:', formId);
            showAlert('Форма успешно отправлена', 'success');
            closeModal(form.closest('.modal')?.id);
    }
}

// Обработка создания заказа
function handleCreateOrder(form) {
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());
    
    // Валидация
    if (!orderData.client || !orderData.device) {
        showAlert('Заполните обязательные поля', 'error');
        return;
    }
    
    // Создание нового заказа
    const newOrder = {
        id: AppState.orders.length > 0 ? Math.max(...AppState.orders.map(o => o.id)) + 1 : 1001,
        clientName: orderData.client,
        device: orderData.device,
        issue: orderData.issue || '',
        status: 'new',
        receivedDate: new Date().toLocaleDateString('ru-RU'),
        totalCost: 0,
        urgency: orderData.urgency || 'normal'
    };
    
    AppState.orders.unshift(newOrder);
    
    // Показать уведомление
    showAlert(`Заказ #${newOrder.id} успешно создан`, 'success');
    
    // Закрыть модальное окно
    closeModal('createOrderModal');
    
    // Обновить UI
    updateUI();
    
    // Добавить уведомление
    addNotification(`Новый заказ #${newOrder.id}`, `Создан заказ на ${orderData.device}`);
}

// Загрузка формы создания заказа
function loadCreateOrderForm() {
    const form = document.getElementById('createOrderForm');
    if (!form) return;
    
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">Клиент <span class="text-danger">*</span></label>
            <select class="form-control" name="client" required>
                <option value="">Выберите клиента</option>
                ${AppState.clients.map(client => `
                    <option value="${client.name}">${client.name} (${client.phone})</option>
                `).join('')}
                <option value="new">+ Новый клиент</option>
            </select>
        </div>
        
        <div class="form-group" id="newClientFields" style="display: none;">
            <div class="row">
                <div class="col-md-6">
                    <label class="form-label">ФИО нового клиента</label>
                    <input type="text" class="form-control" name="newClientName">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Телефон</label>
                    <input type="tel" class="form-control" name="newClientPhone">
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Устройство <span class="text-danger">*</span></label>
            <input type="text" class="form-control" name="device" required 
                   placeholder="Например: Ноутбук ASUS X543">
        </div>
        
        <div class="form-group">
            <label class="form-label">Тип устройства</label>
            <select class="form-control" name="deviceType">
                <option value="laptop">Ноутбук</option>
                <option value="pc">Стационарный ПК</option>
                <option value="printer">Принтер/МФУ</option>
                <option value="monitor">Монитор</option>
                <option value="other">Другое</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Описание проблемы</label>
            <textarea class="form-control" name="issue" rows="3" 
                      placeholder="Опишите проблему со слов клиента..."></textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Приоритет</label>
            <div>
                <label class="radio">
                    <input type="radio" name="urgency" value="normal" checked>
                    <span class="radio-text">Обычный</span>
                </label>
                <label class="radio">
                    <input type="radio" name="urgency" value="high">
                    <span class="radio-text">Срочный</span>
                </label>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Примечания</label>
            <textarea class="form-control" name="notes" rows="2" 
                      placeholder="Дополнительная информация..."></textarea>
        </div>
    `;
    
    // Обработка выбора "Новый клиент"
    const clientSelect = form.querySelector('select[name="client"]');
    clientSelect.addEventListener('change', function() {
        const newClientFields = document.getElementById('newClientFields');
        if (this.value === 'new') {
            newClientFields.style.display = 'block';
        } else {
            newClientFields.style.display = 'none';
        }
    });
}

// Обработка входа в систему
function handleLogin(form) {
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    
    // Демо-авторизация
    if (username === 'admin' && password === 'admin') {
        AppState.currentUser = {
            id: 1,
            name: "Иван Петров",
            role: "admin",
            avatar: "ИП"
        };
        
        localStorage.setItem(`${AppConfig.localStorageKey}_user`, JSON.stringify(AppState.currentUser));
        updateUserInfo();
        window.location.href = 'index.html';
    } else {
        showAlert('Неверные учетные данные', 'error');
    }
}

// Добавление уведомления
function addNotification(title, text) {
    const newNotification = {
        id: AppState.notifications.length + 1,
        title,
        text,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'info'
    };
    
    AppState.notifications.unshift(newNotification);
    updateNotificationsBadge();
    
    // Показать toast-уведомление
    showToast(title, text);
}

// Показать toast-уведомление
function showToast(title, message) {
    // Создаем элемент toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${title}</strong>
            <button type="button" class="toast-close">&times;</button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    // Стили для toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        background: white;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    // Анимация появления
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .toast-header {
            padding: 12px 16px;
            background: var(--color-primary);
            color: white;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .toast-body {
            padding: 16px;
            color: var(--color-text);
        }
        .toast-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
    
    // Закрытие toast
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);
    
    document.body.appendChild(toast);
}

// Показать сообщение об ошибке/успехе
function showAlert(message, type = 'info') {
    // Создаем элемент алерта
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <div class="alert-content">${message}</div>
        <button type="button" class="alert-close">&times;</button>
    `;
    
    // Стили для алерта
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 400px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    // Закрытие алерта
    alert.querySelector('.alert-close').addEventListener('click', function() {
        alert.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }, 5000);
    
    document.body.appendChild(alert);
}

// Получить иконку для алерта
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Показать индикатор загрузки
function showLoading() {
    let loading = document.getElementById('globalLoading');
    
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'globalLoading';
        loading.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка...</div>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9998;
        `;
        document.body.appendChild(loading);
    }
    
    loading.style.display = 'flex';
}

// Скрыть индикатор загрузки
function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Установка текущей даты
function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('ru-RU', options);
    
    // Можно добавить отображение даты где-нибудь в интерфейсе
    // Например, в футере или в заголовке
}

// Обновление UI
function updateUI() {
    // Обновляем таблицу заказов на главной странице
    updateRecentOrdersTable();
    
    // Обновляем статистику в виджетах
    updateWidgets();
}

// Обновление таблицы последних заказов
function updateRecentOrdersTable() {
    const tableBody = document.getElementById('recentOrdersTable');
    if (!tableBody) return;
    
    const recentOrders = AppState.orders.slice(0, 5); // Последние 5 заказов
    
    tableBody.innerHTML = recentOrders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${order.clientName}</td>
            <td>${order.device}</td>
            <td><span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></td>
            <td>${order.masterName || '-'}</td>
            <td>${order.receivedDate}</td>
            <td>${order.totalCost ? order.totalCost.toLocaleString('ru-RU') + ' ₽' : '-'}</td>
            <td class="actions-cell">
                <button class="action-btn view" data-order-id="${order.id}" title="Просмотр">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" data-order-id="${order.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Добавляем обработчики для кнопок действий
    tableBody.querySelectorAll('.action-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-order-id'));
            viewOrder(orderId);
        });
    });
    
    tableBody.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-order-id'));
            editOrder(orderId);
        });
    });
}

// Получить класс для статуса
function getStatusClass(status) {
    const classes = {
        'new': 'status-new',
        'diagnostic': 'status-diagnostic',
        'waiting': 'status-waiting',
        'in_progress': 'status-in-progress',
        'ready': 'status-ready',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return classes[status] || 'status-new';
}

// Получить текст статуса
function getStatusText(status) {
    const texts = {
        'new': 'Новый',
        'diagnostic': 'На диагностике',
        'waiting': 'Ожидание запчастей',
        'in_progress': 'В работе',
        'ready': 'Готов к выдаче',
        'completed': 'Выдан',
        'cancelled': 'Отменён'
    };
    return texts[status] || 'Новый';
}

// Обновление виджетов
function updateWidgets() {
    // Можно обновлять значения в виджетах на основе данных
    // Например, подсчитывать статистику из AppState.orders
}

// Просмотр заказа
function viewOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (order) {
        // Здесь будет открытие модального окна с деталями заказа
        showAlert(`Просмотр заказа #${orderId}`, 'info');
        console.log('Просмотр заказа:', order);
    }
}

// Редактирование заказа
function editOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (order) {
        // Здесь будет открытие формы редактирования заказа
        showAlert(`Редактирование заказа #${orderId}`, 'info');
        console.log('Редактирование заказа:', order);
    }
}

// Экспорт данных
function exportData(type, data) {
    let content, mimeType, filename;
    
    switch (type) {
        case 'csv':
            content = convertToCSV(data);
            mimeType = 'text/csv';
            filename = `export_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'json':
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            filename = `export_${new Date().toISOString().split('T')[0]}.json`;
            break;
        case 'pdf':
            // Для PDF потребуется библиотека
            showAlert('Экспорт в PDF будет реализован позже', 'info');
            return;
        default:
            return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Конвертация в CSV
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
        headers.map(header => 
            JSON.stringify(row[header] || '')
        ).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
}

// Экспорт текущей страницы в PDF
function exportPageToPDF() {
    // Это демо-функция, в реальности потребуется библиотека типа jsPDF
    showAlert('Функция экспорта в PDF будет доступна в полной версии', 'info');
}

// Сохранение настроек
function saveSettings(settings) {
    localStorage.setItem(`${AppConfig.localStorageKey}_settings`, JSON.stringify(settings));
    showAlert('Настройки сохранены', 'success');
}

// Загрузка настроек
function loadSettings() {
    const saved = localStorage.getItem(`${AppConfig.localStorageKey}_settings`);
    return saved ? JSON.parse(saved) : {};
}

// Выход из системы
function logout() {
    localStorage.removeItem(`${AppConfig.localStorageKey}_user`);
    window.location.href = 'pages/login.html';
}

// Добавляем глобальные функции
window.App = {
    config: AppConfig,
    state: AppState,
    functions: {
        openModal,
        closeModal,
        showAlert,
        showLoading,
        hideLoading,
        exportData,
        logout
    }
};

console.log('Основной скрипт загружен');