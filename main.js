// Existing classes (Farmer, FarmersManager, Purchase, PurchasesManager, ExpenseCalculator, Category, CategoriesManager, Order, OrdersManager) remain as previously integrated.

// ===== NEW CLASSES FOR THE INVENTORY MANAGEMENT MODULE =====
class InventoryItem {
  constructor(id, category, quantityAvailable, reorderLevel, restockDate, storageLocation) {
    this.id = id;
    this.category = category;
    this.quantityAvailable = quantityAvailable;
    this.reorderLevel = reorderLevel;
    this.restockDate = restockDate;
    this.storageLocation = storageLocation;
  }
}

class InventoryManager {
  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('inventoryItems');
    this.inventoryItems = data ? JSON.parse(data) : [];
  }

  save() {
    localStorage.setItem('inventoryItems', JSON.stringify(this.inventoryItems));
  }

  addOrUpdateItem(id, category, quantityAvailable, reorderLevel, restockDate, storageLocation) {
    if (id) {
      // Update existing
      const item = this.inventoryItems.find(i => i.id == id);
      if (item) {
        item.category = category;
        item.quantityAvailable = Number(quantityAvailable);
        item.reorderLevel = Number(reorderLevel);
        item.restockDate = restockDate;
        item.storageLocation = storageLocation;
      }
    } else {
      // Add new
      const newItem = new InventoryItem(Date.now(), category, Number(quantityAvailable), Number(reorderLevel), restockDate, storageLocation);
      this.inventoryItems.push(newItem);
    }
    this.save();
  }

  deleteItem(id) {
    this.inventoryItems = this.inventoryItems.filter(i => i.id != id);
    this.save();
  }

  updateStock(id, change) {
    const item = this.inventoryItems.find(i => i.id == id);
    if (item) {
      item.quantityAvailable = Math.max(0, item.quantityAvailable + Number(change));
      this.save();
    }
  }

  getAll() {
    return this.inventoryItems;
  }

  // Check if any item needs reorder (quantity < reorderLevel)
  itemsNeedingReorder() {
    return this.inventoryItems.filter(i => i.quantityAvailable < i.reorderLevel);
  }

  // Simple demand forecasting: Check if units sold in last period > earlier period
  demandForecast(ordersManager) {
    const allOrders = ordersManager.getAll();
    // For simplicity, compare last 5 orders vs previous 5 orders total quantity
    const last5 = allOrders.slice(-5);
    const prev5 = allOrders.slice(-10, -5);
    const last5Sum = last5.reduce((sum, o) => sum + o.quantity, 0);
    const prev5Sum = prev5.reduce((sum, o) => sum + o.quantity, 0);

    let message = "Demand is stable.";
    if (last5Sum > prev5Sum && prev5Sum !== 0) {
      message = "Demand is increasing. Consider increasing reorder levels.";
    } else if (last5Sum < prev5Sum && prev5Sum !== 0) {
      message = "Demand is decreasing. You might reduce stock levels.";
    }

    // Also if any item is below reorder level, suggest reorder
    const needsReorder = this.itemsNeedingReorder();
    if (needsReorder.length > 0) {
      message += "<br>Items below reorder level: " + needsReorder.map(i=>i.category).join(", ") + ". Consider reordering.";
    }

    return message;
  }

  // Simple inventory report: count total items, total stock, items below reorder
  generateInventoryReport(period) {
    const all = this.getAll();
    const totalStock = all.reduce((sum, i) => sum + i.quantityAvailable, 0);
    const needingReorder = this.itemsNeedingReorder().length;
    return `For the selected ${period} period: Total Stock: ${totalStock} kg. Items below reorder: ${needingReorder}.`;
  }
}

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
  const farmersManager = new FarmersManager();
  const purchasesManager = new PurchasesManager();
  const categoriesManager = new CategoriesManager();
  const ordersManager = new OrdersManager();
  const inventoryManager = new InventoryManager(); // new inventory manager

  // Elements for Farmers & Purchases
  const farmerForm = document.getElementById('farmer-form');
  const farmersTableBody = document.querySelector('#farmers-table tbody');
  const farmerSearch = document.getElementById('farmer-search');
  const exportFarmersBtn = document.getElementById('export-farmers');

  const purchaseForm = document.getElementById('purchase-form');
  const purchaseFarmerSelect = purchaseForm.querySelector('select[name="farmerId"]');
  const purchaseInventoryItemSelect = purchaseForm.querySelector('select[name="inventoryItemId"]');
  const purchasesTableBody = document.querySelector('#purchases-table tbody');
  const sortButtons = document.querySelectorAll('.sort-purchase');

  const expenseForm = document.getElementById('expense-form');
  const totalExpensesEl = document.getElementById('total-expenses');

  // Categories & Inventory
  const categoriesTableBody = document.querySelector('#categories-table tbody');
  const categoryPriceForm = document.getElementById('category-price-form');
  const inventoryTableBody = document.querySelector('#inventory-table tbody');
  const reorderForm = document.getElementById('reorder-form');
  const stockForm = document.getElementById('stock-form');
  const costCalcForm = document.getElementById('cost-calculator-form');
  const calculatedCostEl = document.getElementById('calculated-cost');

  const categorySelectForPrice = categoryPriceForm.querySelector('select[name="categoryId"]');
  const categorySelectForThreshold = reorderForm.querySelector('select[name="categoryId"]');
  const categorySelectForStock = stockForm.querySelector('select[name="categoryId"]');
  const categorySelectForCalc = costCalcForm.querySelector('select[name="categoryId"]');

  // Orders
  const orderForm = document.getElementById('order-form');
  const orderCategorySelect = document.getElementById('order-filter-category');
  const ordersTableBody = document.querySelector('#orders-table tbody');
  const orderSearchCustomer = document.getElementById('order-search-customer');
  const orderFilterStatus = document.getElementById('order-filter-status');

  const filterOrdersBtn = document.getElementById('filter-orders');
  const generateSalesReportBtn = document.getElementById('generate-sales-report');
  const exportSalesReportBtn = document.getElementById('export-sales-report');
  const salesReportDiv = document.getElementById('sales-report');

  // Financial Analysis
  const financialForm = document.getElementById('financial-form');
  const financialIncomeEl = document.getElementById('financial-income');
  const financialExpensesEl = document.getElementById('financial-expenses');
  const financialTaxEl = document.getElementById('financial-tax');
  const financialNetProfitEl = document.getElementById('financial-net-profit');

  // Inventory Items (Module 5)
  const inventoryItemForm = document.getElementById('inventory-item-form');
  const inventoryItemsTableBody = document.querySelector('#inventory-items-table tbody');
  const demandForecastingBtn = document.getElementById('demand-forecasting-btn');
  const demandForecastingResult = document.getElementById('demand-forecasting-result');
  const inventoryReportPeriod = document.getElementById('inventory-report-period');
  const generateInventoryReportBtn = document.getElementById('generate-inventory-report');
  const inventoryReportDiv = document.getElementById('inventory-report');
  const orderFormInventorySelect = orderForm.querySelector('select[name="inventoryItemId"]');

  // ===== Render Functions =====
  function renderFarmers(farmers) {
    farmersTableBody.innerHTML = '';
    farmers.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.id}</td>
        <td>${f.name}</td>
        <td>${f.contact}</td>
        <td>${f.location}</td>
        <td>
          <button class="edit-farmer" data-id="${f.id}">Edit</button>
          <button class="delete-farmer" data-id="${f.id}">Delete</button>
        </td>
      `;
      farmersTableBody.appendChild(tr);
    });
  }

  function loadFarmers(filter = '') {
    const farmers = filter ? farmersManager.search(filter) : farmersManager.getAll();
    renderFarmers(farmers);
    populateFarmerSelect();
  }

  function populateFarmerSelect() {
    const farmers = farmersManager.getAll();
    purchaseFarmerSelect.innerHTML = '<option value="">Select Farmer</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      purchaseFarmerSelect.appendChild(opt);
    });
  }

  function populateInventoryItemSelects() {
    const items = inventoryManager.getAll();
    purchaseInventoryItemSelect.innerHTML = '<option value="">Select Inventory Item</option>';
    orderFormInventorySelect.innerHTML = '<option value="">Select Inventory Item</option>';
    items.forEach(i => {
      const opt1 = document.createElement('option');
      opt1.value = i.id;
      opt1.textContent = i.category;
      purchaseInventoryItemSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = i.id;
      opt2.textContent = i.category;
      orderFormInventorySelect.appendChild(opt2);
    });
  }

  function renderPurchases() {
    const farmers = farmersManager.getAll();
    const purchases = purchasesManager.getAll();
    const items = inventoryManager.getAll();
    purchasesTableBody.innerHTML = '';
    purchases.forEach(p => {
      const farmerName = (farmers.find(f => f.id == p.farmerId) || {}).name || 'Unknown';
      const item = items.find(i => i.id == p.inventoryItemId);
      const itemName = item ? item.category : 'Unknown';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${farmerName}</td>
        <td>${itemName}</td>
        <td>${p.date}</td>
        <td>${p.quantity.toFixed(2)}</td>
        <td>${p.pricePerKg.toFixed(2)}</td>
        <td>${p.totalCost.toFixed(2)}</td>
      `;
      purchasesTableBody.appendChild(tr);
    });
  }

  function calculateExpenses(start, end) {
    const calculator = new ExpenseCalculator(purchasesManager.getAll());
    const total = calculator.calculate(start, end);
    totalExpensesEl.textContent = total.toFixed(2);
  }

  function renderCategories() {
    const categories = categoriesManager.getAll();
    categoriesTableBody.innerHTML = '';
    categorySelectForPrice.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat.id}</td>
        <td>${cat.name}</td>
        <td>${cat.weight}</td>
        <td>$${cat.price.toFixed(2)}</td>
        <td></td>
      `;
      categoriesTableBody.appendChild(tr);

      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelectForPrice.appendChild(opt);
    });
  }

  function renderInventory() {
    const categories = categoriesManager.getAll();
    inventoryTableBody.innerHTML = '';
    categorySelectForThreshold.innerHTML = '<option value="">Select Category</option>';
    categorySelectForStock.innerHTML = '<option value="">Select Category</option>';
    categorySelectForCalc.innerHTML = '<option value="">Select Category</option>';
    orderCategorySelect.innerHTML = '<option value="">All Package Categories</option>';

    categories.forEach(cat => {
      const tr = document.createElement('tr');
      tr.classList.toggle('low-stock', cat.stock < cat.reorderThreshold);
      tr.innerHTML = `
        <td>${cat.name}</td>
        <td>${cat.stock}</td>
        <td>${cat.reorderThreshold}</td>
        <td></td>
        <td></td>
      `;
      inventoryTableBody.appendChild(tr);

      let opt1 = document.createElement('option');
      opt1.value = cat.id;
      opt1.textContent = cat.name;
      categorySelectForThreshold.appendChild(opt1);

      let opt2 = document.createElement('option');
      opt2.value = cat.id;
      opt2.textContent = cat.name;
      categorySelectForStock.appendChild(opt2);

      let opt3 = document.createElement('option');
      opt3.value = cat.id;
      opt3.textContent = cat.name;
      categorySelectForCalc.appendChild(opt3);

      let opt4 = document.createElement('option');
      opt4.value = cat.id;
      opt4.textContent = cat.name;
      orderCategorySelect.appendChild(opt4);
    });
  }

  function renderOrders(orders) {
    const items = inventoryManager.getAll();
    ordersTableBody.innerHTML = '';
    orders.forEach(o => {
      const item = items.find(i => i.id == o.inventoryItemId);
      const itemName = item ? item.category : 'Unknown';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.customerContact}</td>
        <td>${o.shippingInfo}</td>
        <td>${itemName}</td>
        <td>${o.quantity}</td>
        <td>$${o.totalPrice.toFixed(2)}</td>
        <td>${o.status}</td>
        <td>
          <select class="update-order-status" data-id="${o.id}">
            <option value="Pending" ${o.status==="Pending"?"selected":""}>Pending</option>
            <option value="Processed" ${o.status==="Processed"?"selected":""}>Processed</option>
            <option value="Shipped" ${o.status==="Shipped"?"selected":""}>Shipped</option>
            <option value="Delivered" ${o.status==="Delivered"?"selected":""}>Delivered</option>
          </select>
        </td>
      `;
      ordersTableBody.appendChild(tr);
    });
  }

  function filterAndRenderOrders() {
    const filters = {
      customerName: orderSearchCustomer.value,
      categoryId: orderFilterCategory.value,
      status: orderFilterStatus.value
    };
    const filtered = ordersManager.filterOrders(filters, categoriesManager.getAll());
    renderOrders(filtered);
  }

  function generateSalesReport() {
    const categories = categoriesManager.getAll();
    const report = ordersManager.generateSalesReport(categories);

    let html = `<h4>Sales Report</h4>`;
    html += `<p>Total Units Sold: ${report.totalUnits}</p>`;
    html += `<p>Total Revenue: $${report.totalRevenue.toFixed(2)}</p>`;
    html += `<table border="1" cellpadding="5"><tr><th>Category</th><th>Units Sold</th><th>Revenue</th></tr>`;
    for (let catId in report.perCategory) {
      const c = report.perCategory[catId];
      html += `<tr><td>${c.name}</td><td>${c.units}</td><td>$${c.revenue.toFixed(2)}</td></tr>`;
    }
    html += `</table>`;
    salesReportDiv.innerHTML = html;
    return report;
  }

  function exportSalesReportCSV(report) {
    let csv = "Category,Units Sold,Revenue\n";
    for (let catId in report.perCategory) {
      const c = report.perCategory[catId];
      csv += `${c.name},${c.units},${c.revenue.toFixed(2)}\n`;
    }
    csv += `\nTotal Units Sold,${report.totalUnits},\n`;
    csv += `Total Revenue,${report.totalRevenue.toFixed(2)},\n`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sales_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Financial Analysis
  function calculateFinancialAnalysis(startDate, endDate, taxRate) {
    const orders = ordersManager.getAll();
    const purchases = purchasesManager.getAll();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // For simplicity, no order date field is stored; consider all orders as in the period
    let income = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    let expenses = 0;
    purchases.forEach(p => {
      const pDate = new Date(p.date);
      if (pDate >= start && pDate <= end) {
        expenses += p.totalCost;
      }
    });

    const tax = income * taxRate;
    const netProfit = income - expenses - tax;

    financialIncomeEl.textContent = income.toFixed(2);
    financialExpensesEl.textContent = expenses.toFixed(2);
    financialTaxEl.textContent = tax.toFixed(2);
    financialNetProfitEl.textContent = netProfit.toFixed(2);
  }

  // Inventory Items
  function renderInventoryItems() {
    const items = inventoryManager.getAll();
    inventoryItemsTableBody.innerHTML = '';
    items.forEach(i => {
      const tr = document.createElement('tr');
      const belowReorder = i.quantityAvailable < i.reorderLevel;
      tr.classList.toggle('low-stock', belowReorder);
      // If restock date is soon (within next 3 days), highlight
      const restockSoon = i.restockDate && (new Date(i.restockDate) - new Date()) < 3*24*60*60*1000;
      if (restockSoon) tr.classList.add('reorder-alert');
      tr.innerHTML = `
        <td>${i.id}</td>
        <td>${i.category}</td>
        <td>${i.quantityAvailable}</td>
        <td>${i.reorderLevel}</td>
        <td>${i.restockDate || ''}</td>
        <td>${i.storageLocation || ''}</td>
        <td>
          <button class="edit-inventory-item" data-id="${i.id}">Edit</button>
          <button class="delete-inventory-item" data-id="${i.id}">Delete</button>
        </td>
      `;
      inventoryItemsTableBody.appendChild(tr);
    });
  }

  // Demand Forecasting
  function showDemandForecast() {
    const message = inventoryManager.demandForecast(ordersManager);
    demandForecastingResult.innerHTML = message;
  }

  // Inventory Reporting
  function showInventoryReport() {
    const period = inventoryReportPeriod.value;
    const reportMsg = inventoryManager.generateInventoryReport(period);
    inventoryReportDiv.innerHTML = reportMsg;
  }

  // Event Listeners for Farmers
  farmerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(farmerForm);
    const id = formData.get('id');
    const name = formData.get('name');
    const contact = formData.get('contact');
    const location = formData.get('location');

    if (id) {
      farmersManager.updateFarmer(id, name, contact, location);
    } else {
      farmersManager.addFarmer(name, contact, location);
    }

    farmerForm.reset();
    loadFarmers(farmerSearch.value);
  });

  farmersTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-farmer')) {
      const id = e.target.dataset.id;
      farmersManager.deleteFarmer(id);
      loadFarmers(farmerSearch.value);
    } else if (e.target.classList.contains('edit-farmer')) {
      const id = e.target.dataset.id;
      const farmer = farmersManager.getAll().find(f => f.id == id);
      if (farmer) {
        farmerForm.elements['id'].value = farmer.id;
        farmerForm.elements['name'].value = farmer.name;
        farmerForm.elements['contact'].value = farmer.contact;
        farmerForm.elements['location'].value = farmer.location;
      }
    }
  });

  farmerSearch.addEventListener('input', () => {
    loadFarmers(farmerSearch.value);
  });

  exportFarmersBtn.addEventListener('click', () => {
    const farmers = farmersManager.getAll();
    let csv = "FarmerID,Name,Contact,Location\n";
    farmers.forEach(f => {
      csv += `${f.id},${f.name},${f.contact},${f.location}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "farmers.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Purchases
  purchaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(purchaseForm);
    const farmerId = formData.get('farmerId');
    const inventoryItemId = formData.get('inventoryItemId');
    const date = formData.get('date');
    const quantity = formData.get('quantity');
    const pricePerKg = formData.get('pricePerKg');

    const p = purchasesManager.addPurchase(farmerId, date, quantity, pricePerKg);
    p.inventoryItemId = Number(inventoryItemId);
    // Increase stock in inventory item
    inventoryManager.updateStock(inventoryItemId, quantity);
    purchasesManager.save();

    purchaseForm.reset();
    renderPurchases();
    renderInventoryItems();
  });

  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sortField = btn.dataset.sort;
      purchasesManager.sortByField(sortField, farmersManager.getAll());
      renderPurchases();
    });
  });

  // Expenses
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(expenseForm);
    const start = formData.get('start');
    const end = formData.get('end');
    calculateExpenses(start, end);
  });

  // Categories & Inventory
  categoryPriceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(categoryPriceForm);
    const catId = formData.get('categoryId');
    const newPrice = formData.get('newPrice');
    if (catId && newPrice) {
      categoriesManager.updatePrice(catId, newPrice);
      categoryPriceForm.reset();
      renderCategories();
      renderInventory();
    }
  });

  reorderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(reorderForm);
    const catId = formData.get('categoryId');
    const newThreshold = formData.get('newThreshold');
    if (catId && newThreshold) {
      categoriesManager.updateThreshold(catId, newThreshold);
      reorderForm.reset();
      renderInventory();
    }
  });

  stockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(stockForm);
    const catId = formData.get('categoryId');
    const stockChange = formData.get('stockChange');
    if (catId && stockChange) {
      categoriesManager.updateStock(catId, stockChange);
      stockForm.reset();
      renderInventory();
    }
  });

  costCalcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(costCalcForm);
    const catId = formData.get('categoryId');
    const quantity = formData.get('quantity');
    const categories = categoriesManager.getAll();
    const cat = categories.find(c => c.id == catId);
    if (cat && quantity) {
      const totalCost = cat.price * Number(quantity);
      calculatedCostEl.textContent = totalCost.toFixed(2);
    }
  });

  // Orders
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName');
    const customerContact = formData.get('customerContact');
    const shippingInfo = formData.get('shippingInfo');
    const inventoryItemId = formData.get('inventoryItemId');
    const quantity = formData.get('quantity');
    const status = formData.get('status');
    const items = inventoryManager.getAll();
    const item = items.find(i => i.id == inventoryItemId);
    if (item) {
      const unitPrice = 10; // For simplicity, assume a fixed price or could link to categories. 
      // Or store price in InventoryItem if desired. For now, let's just use a fixed price or zero.
      // Let's assume inventory items also have a price. If not defined, use a default:
      const order = ordersManager.addOrder(customerName, customerContact, shippingInfo, inventoryItemId, quantity, unitPrice, status);
      // Decrease stock of the inventory item
      inventoryManager.updateStock(inventoryItemId, -quantity);
      orderForm.reset();
      filterAndRenderOrders();
      renderInventoryItems();
    }
  });

  ordersTableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('update-order-status')) {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      ordersManager.updateOrderStatus(id, newStatus);
      filterAndRenderOrders();
    }
  });

  filterOrdersBtn.addEventListener('click', filterAndRenderOrders);

  generateSalesReportBtn.addEventListener('click', generateSalesReport);

  exportSalesReportBtn.addEventListener('click', () => {
    const report = ordersManager.generateSalesReport(categoriesManager.getAll());
    exportSalesReportCSV(report);
  });

  // Financial Analysis
  financialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(financialForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRate = parseFloat(formData.get('taxRate'));
    calculateFinancialAnalysis(start, end, taxRate);
  });

  // Inventory Item Form
  inventoryItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(inventoryItemForm);
    const id = formData.get('id');
    const category = formData.get('category');
    const quantityAvailable = formData.get('quantityAvailable');
    const reorderLevel = formData.get('reorderLevel');
    const restockDate = formData.get('restockDate');
    const storageLocation = formData.get('storageLocation');
    inventoryManager.addOrUpdateItem(id, category, quantityAvailable, reorderLevel, restockDate, storageLocation);
    inventoryItemForm.reset();
    renderInventoryItems();
    populateInventoryItemSelects();
  });

  inventoryItemsTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-inventory-item')) {
      const id = e.target.dataset.id;
      inventoryManager.deleteItem(id);
      renderInventoryItems();
      populateInventoryItemSelects();
    } else if (e.target.classList.contains('edit-inventory-item')) {
      const id = e.target.dataset.id;
      const item = inventoryManager.getAll().find(i => i.id == id);
      if (item) {
        inventoryItemForm.elements['id'].value = item.id;
        inventoryItemForm.elements['category'].value = item.category;
        inventoryItemForm.elements['quantityAvailable'].value = item.quantityAvailable;
        inventoryItemForm.elements['reorderLevel'].value = item.reorderLevel;
        inventoryItemForm.elements['restockDate'].value = item.restockDate || '';
        inventoryItemForm.elements['storageLocation'].value = item.storageLocation || '';
      }
    }
  });

  demandForecastingBtn.addEventListener('click', () => {
    showDemandForecast();
  });

  generateInventoryReportBtn.addEventListener('click', () => {
    showInventoryReport();
  });


  // Elements for Packaging
  const packagingForm = document.getElementById('packaging-form');
  const packagingResult = document.getElementById('packaging-result');
  const packagingInventoryItemSelect = packagingForm.querySelector('select[name="inventoryItemId"]');
  const packagingCategorySelect = packagingForm.querySelector('select[name="categoryId"]');

  // Extend the initial load functions to also populate the packaging form selects
  function populatePackagingFormSelects() {
    const items = inventoryManager.getAll();
    const categories = categoriesManager.getAll();

    packagingInventoryItemSelect.innerHTML = '<option value="">Select Raw Inventory Item</option>';
    items.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = `${i.category} (Raw Inventory)`;
      packagingInventoryItemSelect.appendChild(opt);
    });

    packagingCategorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      packagingCategorySelect.appendChild(opt);
    });
  }

  // Call populate after data is loaded
  populatePackagingFormSelects();

  // Packaging Event Listener
  packagingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(packagingForm);
    const inventoryItemId = formData.get('inventoryItemId');
    const categoryId = formData.get('categoryId');
    const unitsToPackage = parseInt(formData.get('unitsToPackage'), 10);

    const item = inventoryManager.getAll().find(i => i.id == inventoryItemId);
    const cat = categoriesManager.getAll().find(c => c.id == categoryId);

    if (!item || !cat) {
      packagingResult.innerHTML = "<p style='color:red;'>Invalid selection. Please choose a valid inventory item and category.</p>";
      return;
    }

    // Determine weight needed: category.weight could be something like "100g" or "1kg".
    // Convert it to kg for calculation.
    let weightStr = cat.weight.toLowerCase();
    let weightKg;
    if (weightStr.includes('g')) {
      // e.g., "100g"
      const grams = parseFloat(weightStr);
      weightKg = grams / 1000;
    } else if (weightStr.includes('kg')) {
      // e.g., "1kg"
      weightKg = parseFloat(weightStr); 
    } else {
      // If it's "Custom" or something else, for simplicity assume 1kg
      weightKg = 1;
    }

    const totalNeeded = weightKg * unitsToPackage; // total kg needed from raw inventory

    if (item.quantityAvailable < totalNeeded) {
      packagingResult.innerHTML = `<p style='color:red;'>Not enough raw inventory. Needed ${totalNeeded} kg, but only ${item.quantityAvailable} kg available.</p>`;
      return;
    }

    // Proceed with packaging:
    // Deduct from raw inventory item
    item.quantityAvailable -= totalNeeded;
    inventoryManager.save();

    // Add units to the chosen category stock
    categoriesManager.updateStock(categoryId, unitsToPackage);
    // categoriesManager.save() is called inside updateStock

    // Update UI
    packagingResult.innerHTML = `<p style='color:green;'>Successfully packaged ${unitsToPackage} units of ${cat.name}, using ${totalNeeded} kg of ${item.category}.</p>`;

    // Refresh displays
    renderInventoryItems();
    renderCategories(); // to update category stock
    renderInventory();  // update category inventories if needed
  });

  // Initial Load
  loadFarmers();
  renderPurchases();
  renderCategories();
  renderInventory();
  filterAndRenderOrders();
  renderInventoryItems();
  populateInventoryItemSelects();
});
