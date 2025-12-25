// Логика для дашборда

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        initDashboard();
    }
});

function initDashboard() {
    console.log('Инициализация дашборда');
    
    // Инициализация графика
    initChart();
    
    // Обновление виджетов
    updateDashboardWidgets();
    
    // Загрузка последних заказов
    loadRecentOrders();
    
    // Настройка обработчиков событий для дашборда
    setupDashboardEventListeners();
}

function initChart() {
    const ctx = document.getElementById('mastersChart');
    if (!ctx) return;
    
    // Данные для графика
    const masters = ['Петр Сидоров', 'Иван Козлов', 'Алексей Волков'];
    const ordersCount = [8, 5, 7];
    const efficiency = [95, 88, 92];
    
    // Создание графика
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: masters,
            datasets: [
                {
                    label: 'Заказов за неделю',
                    data: ordersCount,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Эффективность (%)',
                    data: efficiency,
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Количество заказов'
                    },
                    min: 0,
                    max: 10
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Эффективность (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.parsed.y + ' заказов';
                            } else {
                                label += context.parsed.y + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function updateDashboardWidgets() {
    // Расчет статистики
    const totalOrders = AppState.orders.length;
    const newOrders = AppState.orders.filter(o => o.status === 'new').length;
    const inProgressOrders = AppState.orders.filter(o => o.status === 'in_progress').length;
    const readyOrders = AppState.orders.filter(o => o.status === 'ready').length;
    
    // Общий доход (сумма всех выполненных заказов)
    const totalIncome = AppState.orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.totalCost || 0), 0);
    
    // Обновляем виджеты
    updateWidgetValue('widget-new-orders', newOrders);
    updateWidgetValue('widget-in-progress', inProgressOrders);
    updateWidgetValue('widget-ready', readyOrders);
    updateWidgetValue('widget-income', totalIncome.toLocaleString('ru-RU') + ' ₽');
    
    // Расчет изменений (демо-данные)
    updateWidgetChange('widget-new-orders', '+2');
    updateWidgetChange('widget-in-progress', '-1');
    updateWidgetChange('widget-ready', '+3');
    updateWidgetChange('widget-income', '+12,500 ₽');
}

function updateWidgetValue(widgetId, value) {
    const widget = document.querySelector(`#${widgetId} .widget-value`);
    if (widget) {
        widget.textContent = value;
    }
}

function updateWidgetChange(widgetId, change) {
    const widget = document.querySelector(`#${widgetId} .widget-change`);
    if (widget) {
        const isPositive = !change.startsWith('-');
        widget.innerHTML = `
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            <span>${change}</span>
        `;
        widget.className = `widget-change ${isPositive ? 'positive' : 'negative'}`;
    }
}

function loadRecentOrders() {
    // Эта функция вызывается из main.js
    // Здесь можно добавить дополнительную логику для дашборда
}

function setupDashboardEventListeners() {
    // Обработка кликов по виджетам
    document.querySelectorAll('.widget').forEach(widget => {
        widget.addEventListener('click', function() {
            const title = this.querySelector('.widget-title').textContent;
            handleWidgetClick(title);
        });
    });
    
    // Обновление графика при изменении периода
    const periodSelect = document.querySelector('.chart-section select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateChartData(this.value);
        });
    }
}

function handleWidgetClick(widgetTitle) {
    console.log('Клик по виджету:', widgetTitle);
    
    // В зависимости от виджета выполняем разные действия
    switch(widgetTitle) {
        case 'Новых заказов':
            window.location.href = 'pages/orders.html?status=new';
            break;
        case 'В работе':
            window.location.href = 'pages/orders.html?status=in_progress';
            break;
        case 'Готово к выдаче':
            window.location.href = 'pages/orders.html?status=ready';
            break;
        case 'Предварительный доход':
            window.location.href = 'pages/reports.html';
            break;
    }
}

function updateChartData(period) {
    console.log('Обновление графика для периода:', period);
    
    // Здесь будет логика обновления данных графика
    // в зависимости от выбранного периода
    
    showAlert(`График обновлен для периода: ${period}`, 'info');
}

// Функция для быстрого создания тестовых данных
function generateTestData() {
    // Генерация тестовых заказов
    const testOrders = [];
    const statuses = ['new', 'diagnostic', 'in_progress', 'ready', 'completed'];
    const devices = ['Ноутбук ASUS', 'ПК Dell', 'Принтер HP', 'Монитор Samsung', 'МФУ Canon'];
    const clients = ['Александр Иванов', 'Мария Петрова', 'Сергей Смирнов', 'Ольга Николаева'];
    
    for (let i = 0; i < 10; i++) {
        testOrders.push({
            id: 1000 + i,
            clientName: clients[Math.floor(Math.random() * clients.length)],
            device: `${devices[Math.floor(Math.random() * devices.length)]} ${Math.floor(Math.random() * 1000)}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            receivedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
            totalCost: Math.floor(Math.random() * 10000) + 1000
        });
    }
    
    AppState.orders = [...AppState.orders, ...testOrders];
    updateUI();
    showAlert('Добавлено 10 тестовых заказов', 'success');
}

// Добавляем функцию в глобальную область видимости для тестирования
window.generateTestData = generateTestData;