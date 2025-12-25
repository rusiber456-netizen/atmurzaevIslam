// Логика для работы с заказами

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('orders.html')) {
        initOrdersPage();
    }
});

function initOrdersPage() {
    console.log('Инициализация страницы заказов');
    
    // Загрузка данных
    loadOrdersData();
    
    // Настройка обработчиков событий
    setupOrdersEventListeners();
    
    // Применение фильтров из URL
    applyUrlFilters();
    
    // Инициализация таблицы
    initOrdersTable();
}

function loadOrdersData() {
    // Используем данные из AppState или загружаем с сервера
    if (AppState.orders.length === 0 && AppConfig.mockData) {
        // Генерация дополнительных тестовых данных для страницы заказов
        generateOrdersTestData();
    }
    
    renderOrdersTable();
    updateOrdersCount();
}

function generateOrdersTestData() {
    const statuses = ['new', 'diagnostic', 'in_progress', 'ready', 'completed', 'cancelled'];
    const devices = [
        'Ноутбук ASUS X543MA',
        'ПК Dell OptiPlex 3070',
        'Принтер HP LaserJet Pro MFP',
        'Монитор Samsung S24R350',
        'МФУ Canon MF3010',
        'Ноутбук Lenovo IdeaPad 3',
        'Системный блок (сборка)',
        'Планшет Apple iPad 9'
    ];
    const clients = [
        { id: 1, name: 'Александр Иванов', phone: '+7 (999) 111-22-33' },
        { id: 2, name: 'Мария Петрова', phone: '+7 (999) 222-33-44' },
        { id: 3, name: 'Сергей Смирнов', phone: '+7 (999) 333-44-55' },
        { id: 4, name: 'Ольга Николаева', phone: '+7 (999) 444-55-66' },
        { id: 5, name: 'Дмитрий Кузнецов', phone: '+7 (999) 555-66-77' }
    ];
    const masters = [
        { id: 1, name: 'Петр Сидоров' },
        { id: 2, name: 'Иван Козлов' },
        { id: 3, name: 'Алексей Волков' }
    ];
    
    const testOrders = [];
    
    for (let i = 0; i < 25; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const master = masters[Math.floor(Math.random() * masters.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const receivedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        testOrders.push({
            id: 1000 + i,
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            device: devices[Math.floor(Math.random() * devices.length)],
            deviceType: getDeviceType(devices[Math.floor(Math.random() * devices.length)]),
            issue: getRandomIssue(),
            status: status,
            masterId: master.id,
            masterName: master.name,
            receivedDate: receivedDate.toLocaleDateString('ru-RU'),
            completionDate: status === 'completed' || status === 'cancelled' 
                ? new Date(receivedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
                : null,
            workCost: Math.floor(Math.random() * 5000) + 1000,
            partsCost: Math.floor(Math.random() * 3000) + 500,
            totalCost: Math.floor(Math.random() * 8000) + 1500,
            urgency: Math.random() > 0.8 ? 'high' : 'normal',
            notes: Math.random() > 0.7 ? 'Срочный заказ' : ''
        });
    }
    
    // Добавляем тестовые данные в AppState
    AppState.orders = [...AppState.orders, ...testOrders];
}

function getDeviceType(device) {
    if (device.includes('Ноутбук')) return 'laptop';
    if (device.includes('ПК') || device.includes('Системный блок')) return 'pc';
    if (device.includes('Принтер') || device.includes('МФУ')) return 'printer';
    if (device.includes('Монитор')) return 'monitor';
    if (device.includes('Планшет')) return 'tablet';
    return 'other';
}

function getRandomIssue() {
    const issues = [
        'Не включается',
        'Не загружается операционная система',
        'Медленно работает',
        'Перегревается и выключается',
        'Не работает Wi-Fi',
        'Не печатает',
        'Бьёт током',
        'Разбит экран',
        'Не заряжается',
        'Шумит вентилятор'
    ];
    return issues[Math.floor(Math.random() * issues.length)];
}

function setupOrdersEventListeners() {
    // Фильтры
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    
    // Поиск
    const searchInput = document.getElementById('ordersSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performOrdersSearch, 300));
    }
    
    // Выбор всех
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#ordersTableBody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    
    // Кнопки действий
    document.getElementById('createOrderBtn')?.addEventListener('click', function() {
        openModal('createOrderModal');
        loadCreateOrderForm();
    });
    
    document.getElementById('createFirstOrder')?.addEventListener('click', function() {
        openModal('createOrderModal');
        loadCreateOrderForm();
    });
    
    document.getElementById('exportOrders')?.addEventListener('click', exportOrders);
    document.getElementById('printOrders')?.addEventListener('click', printOrders);
    
    // Формы
    document.getElementById('createOrderForm')?.addEventListener('submit', handleCreateOrder);
    document.getElementById('editOrderForm')?.addEventListener('submit', handleEditOrder);
    
    // Редактирование из деталей
    document.getElementById('editOrderFromDetails')?.addEventListener('click', function() {
        const orderId = parseInt(document.getElementById('orderDetailsId').textContent);
        closeModal('orderDetailsModal');
        editOrder(orderId);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function applyUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status) {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.value = status;
            applyFilters();
        }
    }
}

function initOrdersTable() {
    // Инициализация сортировки таблицы
    const table = document.getElementById('ordersTable');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        if (index > 0 && index < headers.length - 1) { // Пропускаем колонку с чекбоксами и действиями
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => sortTable(index));
        }
    });
}

function sortTable(columnIndex) {
    // Реализация сортировки таблицы
    console.log(`Сортировка по колонке ${columnIndex}`);
    // Здесь будет логика сортировки
}

function renderOrdersTable(filteredOrders = null) {
    const tableBody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tableBody || !emptyState) return;
    
    const orders = filteredOrders || AppState.orders;
    
    if (orders.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    tableBody.innerHTML = orders.map(order => `
        <tr data-order-id="${order.id}">
            <td>
                <input type="checkbox" class="order-checkbox" value="${order.id}">
            </td>
            <td>#${order.id}</td>
            <td>
                <div class="font-weight-500">${order.clientName}</div>
                <div class="text-muted small">${order.clientPhone || ''}</div>
            </td>
            <td>
                <div>${order.device}</div>
                <div class="text-muted small">${order.issue || ''}</div>
            </td>
            <td>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
                ${order.urgency === 'high' ? '<span class="badge badge-danger ml-1">Срочный</span>' : ''}
            </td>
            <td>${order.masterName || '-'}</td>
            <td>${order.receivedDate}</td>
            <td class="font-weight-500">
                ${order.totalCost ? order.totalCost.toLocaleString('ru-RU') + ' ₽' : '-'}
            </td>
            <td class="actions-cell">
                <button class="action-btn view" data-order-id="${order.id}" title="Просмотр">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" data-order-id="${order.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" data-order-id="${order.id}" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Добавляем обработчики событий для кнопок действий
    tableBody.querySelectorAll('.action-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-order-id'));
            viewOrderDetails(orderId);
        });
    });
    
    tableBody.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-order-id'));
            editOrder(orderId);
        });
    });
    
    tableBody.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = parseInt(this.getAttribute('data-order-id'));
            deleteOrder(orderId);
        });
    });
    
    // Обработка чекбоксов
    tableBody.querySelectorAll('.order-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedOrders);
    });
    
    // Инициализация пагинации
    initPagination(orders);
}

function initPagination(orders) {
    const pagination = document.getElementById('ordersPagination');
    if (!pagination) return;
    
    const pageSize = 10;
    const pageCount = Math.ceil(orders.length / pageSize);
    
    if (pageCount <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button class="pagination-item" data-page="first">
            <i class="fas fa-angle-double-left"></i>
        </button>
        <button class="pagination-item" data-page="prev">
            <i class="fas fa-angle-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= pageCount; i++) {
        paginationHTML += `
            <button class="pagination-item ${i === 1 ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="pagination-item" data-page="next">
            <i class="fas fa-angle-right"></i>
        </button>
        <button class="pagination-item" data-page="last">
            <i class="fas fa-angle-double-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Обработчики событий для пагинации
    pagination.querySelectorAll('.pagination-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const pageAction = this.getAttribute('data-page');
            handlePagination(pageAction, pageCount);
        });
    });
}

let currentPage = 1;

function handlePagination(action, pageCount) {
    switch(action) {
        case 'first':
            currentPage = 1;
            break;
        case 'prev':
            if (currentPage > 1) currentPage--;
            break;
        case 'next':
            if (currentPage < pageCount) currentPage++;
            break;
        case 'last':
            currentPage = pageCount;
            break;
        default:
            currentPage = parseInt(action);
    }
    
    // Обновляем активную страницу
    document.querySelectorAll('.pagination-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === currentPage.toString()) {
            btn.classList.add('active');
        }
    });
    
    // Применяем пагинацию к данным
    applyPagination();
}

function applyPagination() {
    // Здесь будет логика отображения данных для текущей страницы
    console.log(`Текущая страница: ${currentPage}`);
    // В реальном приложении здесь нужно обновить таблицу
}

function applyFilters() {
    const status = document.getElementById('statusFilter')?.value;
    const master = document.getElementById('masterFilter')?.value;
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;
    const search = document.getElementById('ordersSearch')?.value.toLowerCase();
    
    let filteredOrders = AppState.orders;
    
    // Фильтр по статусу
    if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    // Фильтр по мастеру
    if (master) {
        filteredOrders = filteredOrders.filter(order => order.masterId === parseInt(master));
    }
    
    // Фильтр по дате
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.receivedDate.split('.').reverse().join('-'));
            return orderDate >= fromDate;
        });
    }
    
    if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.receivedDate.split('.').reverse().join('-'));
            return orderDate <= toDate;
        });
    }
    
    // Фильтр по поиску
    if (search) {
        filteredOrders = filteredOrders.filter(order => 
            order.clientName.toLowerCase().includes(search) ||
            order.device.toLowerCase().includes(search) ||
            order.issue?.toLowerCase().includes(search) ||
            order.id.toString().includes(search)
        );
    }
    
    renderOrdersTable(filteredOrders);
    updateOrdersCount(filteredOrders.length);
}

function resetFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('masterFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('ordersSearch').value = '';
    
    renderOrdersTable();
    updateOrdersCount();
}

function performOrdersSearch() {
    applyFilters();
}

function updateOrdersCount(count = null) {
    const countElement = document.getElementById('ordersCount');
    if (countElement) {
        countElement.textContent = count !== null ? count : AppState.orders.length;
    }
    
    // Обновляем бейдж в навигации
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
        const newOrdersCount = AppState.orders.filter(o => o.status === 'new').length;
        ordersBadge.textContent = newOrdersCount || '';
        ordersBadge.style.display = newOrdersCount > 0 ? 'flex' : 'none';
    }
}

function updateSelectedOrders() {
    const selectedCount = document.querySelectorAll('.order-checkbox:checked').length;
    const selectAll = document.getElementById('selectAll');
    
    if (selectAll) {
        selectAll.checked = selectedCount === document.querySelectorAll('.order-checkbox').length;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < document.querySelectorAll('.order-checkbox').length;
    }
}

function viewOrderDetails(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) {
        showAlert('Заказ не найден', 'error');
        return;
    }
    
    document.getElementById('orderDetailsId').textContent = order.id;
    
    const detailsContent = document.getElementById('orderDetailsContent');
    detailsContent.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <div class="card mb-3">
                    <div class="card-header">
                        <h4 class="card-title mb-0">Информация о заказе</h4>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Клиент</label>
                                    <div class="form-control-static">${order.clientName}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Телефон</label>
                                    <div class="form-control-static">${order.clientPhone || '-'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Устройство</label>
                                    <div class="form-control-static">${order.device}</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Тип устройства</label>
                                    <div class="form-control-static">${getDeviceTypeText(order.deviceType)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group mb-3">
                            <label class="form-label">Описание проблемы</label>
                            <div class="form-control-static">${order.issue || 'Не указано'}</div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Статус</label>
                                    <div>
                                        <span class="status-badge ${getStatusClass(order.status)}">
                                            ${getStatusText(order.status)}
                                        </span>
                                        ${order.urgency === 'high' ? '<span class="badge badge-danger ml-2">Срочный</span>' : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Мастер</label>
                                    <div class="form-control-static">${order.masterName || 'Не назначен'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header">
                        <h4 class="card-title mb-0">Финансовая информация</h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Стоимость работ</label>
                                    <div class="form-control-static font-weight-500">
                                        ${order.workCost ? order.workCost.toLocaleString('ru-RU') + ' ₽' : '-'}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Стоимость запчастей</label>
                                    <div class="form-control-static font-weight-500">
                                        ${order.partsCost ? order.partsCost.toLocaleString('ru-RU') + ' ₽' : '-'}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label class="form-label">Общая стоимость</label>
                                    <div class="form-control-static font-weight-500 text-primary">
                                        ${order.totalCost ? order.totalCost.toLocaleString('ru-RU') + ' ₽' : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header">
                        <h4 class="card-title mb-0">Даты</h4>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Дата приёма</label>
                            <div class="form-control-static">${order.receivedDate}</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Дата выполнения</label>
                            <div class="form-control-static">${order.completionDate || 'В работе'}</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Длительность ремонта</label>
                            <div class="form-control-static">
                                ${calculateRepairDuration(order)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title mb-0">Действия</h4>
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" id="changeStatusBtn" data-order-id="${order.id}">
                                <i class="fas fa-exchange-alt"></i>
                                Сменить статус
                            </button>
                            <button class="btn btn-warning" id="assignMasterBtn" data-order-id="${order.id}">
                                <i class="fas fa-user-cog"></i>
                                Назначить мастера
                            </button>
                            <button class="btn btn-success" id="addWorkBtn" data-order-id="${order.id}">
                                <i class="fas fa-tools"></i>
                                Добавить работу
                            </button>
                            <button class="btn btn-info" id="addPartsBtn" data-order-id="${order.id}">
                                <i class="fas fa-microchip"></i>
                                Добавить запчасти
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем обработчики для кнопок действий в деталях
    detailsContent.querySelector('#changeStatusBtn')?.addEventListener('click', function() {
        const orderId = parseInt(this.getAttribute('data-order-id'));
        changeOrderStatus(orderId);
    });
    
    detailsContent.querySelector('#assignMasterBtn')?.addEventListener('click', function() {
        const orderId = parseInt(this.getAttribute('data-order-id'));
        assignMasterToOrder(orderId);
    });
    
    detailsContent.querySelector('#addWorkBtn')?.addEventListener('click', function() {
        const orderId = parseInt(this.getAttribute('data-order-id'));
        addWorkToOrder(orderId);
    });
    
    detailsContent.querySelector('#addPartsBtn')?.addEventListener('click', function() {
        const orderId = parseInt(this.getAttribute('data-order-id'));
        addPartsToOrder(orderId);
    });
    
    openModal('orderDetailsModal');
}

function getDeviceTypeText(type) {
    const types = {
        'laptop': 'Ноутбук',
        'pc': 'Стационарный ПК',
        'printer': 'Принтер/МФУ',
        'monitor': 'Монитор',
        'tablet': 'Планшет',
        'other': 'Другое'
    };
    return types[type] || type;
}

function calculateRepairDuration(order) {
    if (!order.receivedDate || !order.completionDate) return 'В работе';
    
    const start = new Date(order.receivedDate.split('.').reverse().join('-'));
    const end = new Date(order.completionDate.split('.').reverse().join('-'));
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} ${declOfNum(diffDays, ['день', 'дня', 'дней'])}`;
}

function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

function editOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) {
        showAlert('Заказ не найден', 'error');
        return;
    }
    
    document.getElementById('editOrderId').textContent = order.id;
    
    const form = document.getElementById('editOrderForm');
    form.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Клиент <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="clientName" 
                           value="${order.clientName}" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Телефон</label>
                    <input type="tel" class="form-control" name="clientPhone" 
                           value="${order.clientPhone || ''}">
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Устройство <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" name="device" 
                           value="${order.device}" required>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Тип устройства</label>
                    <select class="form-control" name="deviceType">
                        <option value="laptop" ${order.deviceType === 'laptop' ? 'selected' : ''}>Ноутбук</option>
                        <option value="pc" ${order.deviceType === 'pc' ? 'selected' : ''}>Стационарный ПК</option>
                        <option value="printer" ${order.deviceType === 'printer' ? 'selected' : ''}>Принтер/МФУ</option>
                        <option value="monitor" ${order.deviceType === 'monitor' ? 'selected' : ''}>Монитор</option>
                        <option value="other" ${order.deviceType === 'other' ? 'selected' : ''}>Другое</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Описание проблемы</label>
            <textarea class="form-control" name="issue" rows="3">${order.issue || ''}</textarea>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                        <option value="diagnostic" ${order.status === 'diagnostic' ? 'selected' : ''}>На диагностике</option>
                        <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>В работе</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Готов к выдаче</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Выдан</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменён</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="form-label">Мастер</label>
                    <select class="form-control" name="masterId">
                        <option value="">Не назначен</option>
                        ${AppState.employees.map(emp => `
                            <option value="${emp.id}" ${order.masterId === emp.id ? 'selected' : ''}>
                                ${emp.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-label">Стоимость работ (₽)</label>
                    <input type="number" class="form-control" name="workCost" 
                           value="${order.workCost || ''}" min="0" step="100">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-label">Стоимость запчастей (₽)</label>
                    <input type="number" class="form-control" name="partsCost" 
                           value="${order.partsCost || ''}" min="0" step="100">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-label">Общая стоимость (₽)</label>
                    <input type="number" class="form-control" name="totalCost" 
                           value="${order.totalCost || ''}" min="0" step="100" readonly>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Приоритет</label>
            <div>
                <label class="radio">
                    <input type="radio" name="urgency" value="normal" ${order.urgency !== 'high' ? 'checked' : ''}>
                    <span class="radio-text">Обычный</span>
                </label>
                <label class="radio">
                    <input type="radio" name="urgency" value="high" ${order.urgency === 'high' ? 'checked' : ''}>
                    <span class="radio-text">Срочный</span>
                </label>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Примечания</label>
            <textarea class="form-control" name="notes" rows="2">${order.notes || ''}</textarea>
        </div>
        
        <input type="hidden" name="orderId" value="${order.id}">
    `;
    
    // Автоматический расчет общей стоимости
    const workCostInput = form.querySelector('input[name="workCost"]');
    const partsCostInput = form.querySelector('input[name="partsCost"]');
    const totalCostInput = form.querySelector('input[name="totalCost"]');
    
    function calculateTotal() {
        const workCost = parseFloat(workCostInput.value) || 0;
        const partsCost = parseFloat(partsCostInput.value) || 0;
        totalCostInput.value = workCost + partsCost;
    }
    
    workCostInput.addEventListener('input', calculateTotal);
    partsCostInput.addEventListener('input', calculateTotal);
    
    openModal('editOrderModal');
}

function handleEditOrder(form) {
    const formData = new FormData(form);
    const orderId = parseInt(formData.get('orderId'));
    
    const orderIndex = AppState.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showAlert('Заказ не найден', 'error');
        return;
    }
    
    // Обновляем заказ
    AppState.orders[orderIndex] = {
        ...AppState.orders[orderIndex],
        clientName: formData.get('clientName'),
        clientPhone: formData.get('clientPhone'),
        device: formData.get('device'),
        deviceType: formData.get('deviceType'),
        issue: formData.get('issue'),
        status: formData.get('status'),
        masterId: formData.get('masterId') ? parseInt(formData.get('masterId')) : null,
        masterName: formData.get('masterId') 
            ? AppState.employees.find(e => e.id === parseInt(formData.get('masterId')))?.name || null 
            : null,
        workCost: parseFloat(formData.get('workCost')) || 0,
        partsCost: parseFloat(formData.get('partsCost')) || 0,
        totalCost: parseFloat(formData.get('totalCost')) || 0,
        urgency: formData.get('urgency'),
        notes: formData.get('notes')
    };
    
    showAlert(`Заказ #${orderId} успешно обновлен`, 'success');
    closeModal('editOrderModal');
    renderOrdersTable();
}

function deleteOrder(orderId) {
    if (!confirm(`Вы уверены, что хотите удалить заказ #${orderId}?`)) {
        return;
    }
    
    const orderIndex = AppState.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        showAlert('Заказ не найден', 'error');
        return;
    }
    
    AppState.orders.splice(orderIndex, 1);
    showAlert(`Заказ #${orderId} удален`, 'success');
    renderOrdersTable();
    updateOrdersCount();
}

function changeOrderStatus(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = `
        <div class="form-group">
            <label class="form-label">Текущий статус</label>
            <div class="form-control-static">
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Новый статус</label>
            <select class="form-control" id="newStatus">
                <option value="new">Новый</option>
                <option value="diagnostic">На диагностике</option>
                <option value="in_progress">В работе</option>
                <option value="ready">Готов к выдаче</option>
                <option value="completed">Выдан</option>
                <option value="cancelled">Отменён</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Комментарий</label>
            <textarea class="form-control" id="statusComment" rows="2" 
                      placeholder="Причина смены статуса..."></textarea>
        </div>
        
        <input type="hidden" id="statusOrderId" value="${orderId}">
    `;
    
    showCustomModal('Смена статуса заказа', modalContent, 'Сохранить', 'Отмена', 
        function() {
            const newStatus = document.getElementById('newStatus').value;
            const comment = document.getElementById('statusComment').value;
            const orderId = parseInt(document.getElementById('statusOrderId').value);
            
            updateOrderStatus(orderId, newStatus, comment);
        }
    );
}

function updateOrderStatus(orderId, newStatus, comment = '') {
    const orderIndex = AppState.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    const oldStatus = AppState.orders[orderIndex].status;
    AppState.orders[orderIndex].status = newStatus;
    
    // Если статус "выдан", устанавливаем дату завершения
    if (newStatus === 'completed') {
        AppState.orders[orderIndex].completionDate = new Date().toLocaleDateString('ru-RU');
    }
    
    // Добавляем уведомление
    addNotification(
        `Статус заказа #${orderId} изменен`,
        `Статус изменен с "${getStatusText(oldStatus)}" на "${getStatusText(newStatus)}"`
    );
    
    showAlert(`Статус заказа #${orderId} успешно изменен`, 'success');
    renderOrdersTable();
    
    // Закрываем все модальные окна
    closeAllModals();
}

function assignMasterToOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = `
        <div class="form-group">
            <label class="form-label">Текущий мастер</label>
            <div class="form-control-static">${order.masterName || 'Не назначен'}</div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Новый мастер</label>
            <select class="form-control" id="newMaster">
                <option value="">Не назначен</option>
                ${AppState.employees.map(emp => `
                    <option value="${emp.id}" ${order.masterId === emp.id ? 'selected' : ''}>
                        ${emp.name} (${emp.specialization})
                    </option>
                `).join('')}
            </select>
        </div>
        
        <input type="hidden" id="masterOrderId" value="${orderId}">
    `;
    
    showCustomModal('Назначение мастера', modalContent, 'Назначить', 'Отмена',
        function() {
            const newMasterId = document.getElementById('newMaster').value;
            const orderId = parseInt(document.getElementById('masterOrderId').value);
            
            assignMaster(orderId, newMasterId);
        }
    );
}

function assignMaster(orderId, masterId) {
    const orderIndex = AppState.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;
    
    if (masterId) {
        const master = AppState.employees.find(e => e.id === parseInt(masterId));
        if (master) {
            AppState.orders[orderIndex].masterId = master.id;
            AppState.orders[orderIndex].masterName = master.name;
            
            showAlert(`Мастер "${master.name}" назначен на заказ #${orderId}`, 'success');
            addNotification(
                `Мастер назначен на заказ #${orderId}`,
                `Мастер "${master.name}" назначен на заказ`
            );
        }
    } else {
        AppState.orders[orderIndex].masterId = null;
        AppState.orders[orderIndex].masterName = null;
        showAlert(`Мастер снят с заказа #${orderId}`, 'success');
    }
    
    renderOrdersTable();
    closeAllModals();
}

function addWorkToOrder(orderId) {
    const modalContent = `
        <div class="form-group">
            <label class="form-label">Вид работы</label>
            <select class="form-control" id="workType">
                ${AppState.services.map(service => `
                    <option value="${service.id}" data-price="${service.price}">
                        ${service.name} - ${service.price} ₽
                    </option>
                `).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Количество</label>
            <input type="number" class="form-control" id="workQuantity" value="1" min="1">
        </div>
        
        <div class="form-group">
            <label class="form-label">Стоимость</label>
            <input type="number" class="form-control" id="workCost" readonly>
        </div>
        
        <div class="form-group">
            <label class="form-label">Комментарий</label>
            <textarea class="form-control" id="workComment" rows="2"></textarea>
        </div>
        
        <input type="hidden" id="workOrderId" value="${orderId}">
    `;
    
    showCustomModal('Добавление работы', modalContent, 'Добавить', 'Отмена',
        function() {
            const workType = document.getElementById('workType');
            const selectedOption = workType.options[workType.selectedIndex];
            const workId = parseInt(selectedOption.value);
            const workPrice = parseFloat(selectedOption.getAttribute('data-price'));
            const quantity = parseInt(document.getElementById('workQuantity').value) || 1;
            const comment = document.getElementById('workComment').value;
            const orderId = parseInt(document.getElementById('workOrderId').value);
            
            const totalCost = workPrice * quantity;
            
            // Здесь будет логика добавления работы к заказу
            // В демо-версии просто показываем сообщение
            showAlert(`Работа добавлена к заказу #${orderId}. Стоимость: ${totalCost} ₽`, 'success');
        }
    );
    
    // Автоматический расчет стоимости
    const workType = document.getElementById('workType');
    const workQuantity = document.getElementById('workQuantity');
    const workCost = document.getElementById('workCost');
    
    function calculateWorkCost() {
        const selectedOption = workType.options[workType.selectedIndex];
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        const quantity = parseInt(workQuantity.value) || 1;
        workCost.value = price * quantity;
    }
    
    workType.addEventListener('change', calculateWorkCost);
    workQuantity.addEventListener('input', calculateWorkCost);
    
    calculateWorkCost(); // Инициализация
}

function addPartsToOrder(orderId) {
    const modalContent = `
        <div class="form-group">
            <label class="form-label">Запчасть</label>
            <select class="form-control" id="partType">
                ${AppState.spareParts.map(part => `
                    <option value="${part.id}" data-price="${part.price}" data-stock="${part.stock}">
                        ${part.name} (${part.code}) - ${part.price} ₽ (в наличии: ${part.stock})
                    </option>
                `).join('')}
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Количество</label>
            <input type="number" class="form-control" id="partQuantity" value="1" min="1" max="1">
        </div>
        
        <div class="form-group">
            <label class="form-label">Стоимость</label>
            <input type="number" class="form-control" id="partCost" readonly>
        </div>
        
        <div class="form-group">
            <label class="form-label">Комментарий</label>
            <textarea class="form-control" id="partComment" rows="2"></textarea>
        </div>
        
        <input type="hidden" id="partOrderId" value="${orderId}">
    `;
    
    showCustomModal('Добавление запчастей', modalContent, 'Добавить', 'Отмена',
        function() {
            const partType = document.getElementById('partType');
            const selectedOption = partType.options[partType.selectedIndex];
            const partId = parseInt(selectedOption.value);
            const partPrice = parseFloat(selectedOption.getAttribute('data-price'));
            const quantity = parseInt(document.getElementById('partQuantity').value) || 1;
            const comment = document.getElementById('partComment').value;
            const orderId = parseInt(document.getElementById('partOrderId').value);
            
            const totalCost = partPrice * quantity;
            
            // Здесь будет логика добавления запчастей к заказу
            showAlert(`Запчасти добавлены к заказу #${orderId}. Стоимость: ${totalCost} ₽`, 'success');
        }
    );
    
    // Автоматический расчет стоимости и обновление максимального количества
    const partType = document.getElementById('partType');
    const partQuantity = document.getElementById('partQuantity');
    const partCost = document.getElementById('partCost');
    
    function updatePartInfo() {
        const selectedOption = partType.options[partType.selectedIndex];
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        const stock = parseInt(selectedOption.getAttribute('data-stock'));
        
        partQuantity.max = stock;
        partQuantity.value = Math.min(parseInt(partQuantity.value) || 1, stock);
        
        const quantity = parseInt(partQuantity.value) || 1;
        partCost.value = price * quantity;
    }
    
    partType.addEventListener('change', updatePartInfo);
    partQuantity.addEventListener('input', updatePartInfo);
    
    updatePartInfo(); // Инициализация
}

function showCustomModal(title, content, confirmText, cancelText, confirmCallback) {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" id="customModalClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="customModalCancel">
                    ${cancelText}
                </button>
                <button type="button" class="btn btn-primary" id="customModalConfirm">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Обработчики событий
    modal.querySelector('#customModalClose').addEventListener('click', closeCustomModal);
    modal.querySelector('#customModalCancel').addEventListener('click', closeCustomModal);
    modal.querySelector('#customModalConfirm').addEventListener('click', function() {
        if (confirmCallback) confirmCallback();
        closeCustomModal();
    });
    
    // Закрытие при клике вне контента
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeCustomModal();
    });
    
    function closeCustomModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = '';
        }, 300);
    }
    
    // Сохраняем ссылку для глобального доступа
    window.currentCustomModal = modal;
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

function exportOrders() {
    const selectedOrders = getSelectedOrders();
    const ordersToExport = selectedOrders.length > 0 ? selectedOrders : AppState.orders;
    
    if (ordersToExport.length === 0) {
        showAlert('Нет данных для экспорта', 'warning');
        return;
    }
    
    const exportType = prompt('Выберите формат экспорта (csv или json):', 'csv');
    
    if (exportType && ['csv', 'json'].includes(exportType.toLowerCase())) {
        App.functions.exportData(exportType, ordersToExport);
    }
}

function getSelectedOrders() {
    const selectedIds = [];
    document.querySelectorAll('.order-checkbox:checked').forEach(checkbox => {
        selectedIds.push(parseInt(checkbox.value));
    });
    
    return AppState.orders.filter(order => selectedIds.includes(order.id));
}

function printOrders() {
    const selectedOrders = getSelectedOrders();
    const ordersToPrint = selectedOrders.length > 0 ? selectedOrders : AppState.orders;
    
    if (ordersToPrint.length === 0) {
        showAlert('Нет данных для печати', 'warning');
        return;
    }
    
    // Создаем окно для печати
    const printWindow = window.open('', '_blank');
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Отчет по заказам</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; margin-top: 20px; }
                .date { text-align: right; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>Отчет по заказам ООО "ЧИП"</h1>
            <div class="date">Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
            
            <table>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Клиент</th>
                        <th>Устройство</th>
                        <th>Статус</th>
                        <th>Мастер</th>
                        <th>Дата приёма</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
                    ${ordersToPrint.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.clientName}</td>
                            <td>${order.device}</td>
                            <td>${getStatusText(order.status)}</td>
                            <td>${order.masterName || '-'}</td>
                            <td>${order.receivedDate}</td>
                            <td>${order.totalCost ? order.totalCost.toLocaleString('ru-RU') + ' ₽' : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                Всего заказов: ${ordersToPrint.length}<br>
                Общая сумма: ${ordersToPrint.reduce((sum, order) => sum + (order.totalCost || 0), 0).toLocaleString('ru-RU')} ₽
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}