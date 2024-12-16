// ===== CLASSES =====

// Farmer class with phone, email, address, region, gps
class Farmer {
  constructor(id, name, phone, email, address, region, gpsCoordinates) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.region = region;
    this.gpsCoordinates = gpsCoordinates;
  }
}

class FarmersManager {
  constructor() {
    this.load();
  }
  load() {
    const data = localStorage.getItem('farmers');
    this.farmers = data ? JSON.parse(data) : [];
  }
  save() {
    localStorage.setItem('farmers', JSON.stringify(this.farmers));
  }

  addFarmer(name, phone, email, address, region, gpsCoordinates) {
    const farmer = new Farmer(Date.now(), name, phone, email, address, region, gpsCoordinates);
    this.farmers.push(farmer);
    this.save();
    return farmer;
  }

  updateFarmer(id, name, phone, email, address, region, gpsCoordinates) {
    const idx = this.farmers.findIndex(f => f.id == id);
    if (idx > -1) {
      this.farmers[idx].name = name;
      this.farmers[idx].phone = phone;
      this.farmers[idx].email = email;
      this.farmers[idx].address = address;
      this.farmers[idx].region = region;
      this.farmers[idx].gpsCoordinates = gpsCoordinates;
      this.save();
    }
  }

  deleteFarmer(id) {
    this.farmers = this.farmers.filter(f => f.id != id);
    this.save();
  }

  search(query) {
    const lower = query.toLowerCase();
    return this.farmers.filter(f =>
      f.name.toLowerCase().includes(lower) ||
      f.region.toLowerCase().includes(lower)
    );
  }

  getAll() {
    return this.farmers;
  }
}

function validateFarmerInputs(name, phone, email, address, region, gps) {
  if (!name.trim()) return "Name is required.";
  const phoneRegex = /^[0-9]{5,15}$/;
  if (!phoneRegex.test(phone)) return "Phone must be digits only (5-15 chars).";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format.";
  if (!address.trim()) return "Address is required.";
  if (!region.trim()) return "Region is required.";
  if (!gps.trim()) return "GPS Coordinates are required.";
  return null;
}

// Purchase class without inventory item link
class Purchase {
  constructor(id, farmerId, date, quantity, pricePerKg) {
    this.id = id;
    this.farmerId = farmerId;
    this.date = date;
    this.quantity = quantity;
    this.pricePerKg = pricePerKg;
    this.totalCost = quantity * pricePerKg;
  }
}

class PurchasesManager {
  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('purchases');
    this.purchases = data ? JSON.parse(data) : [];
  }

  save() {
    localStorage.setItem('purchases', JSON.stringify(this.purchases));
  }

  addPurchase(farmerId, date, quantity, pricePerKg) {
    const purchase = new Purchase(Date.now(), Number(farmerId), date, Number(quantity), Number(pricePerKg));
    this.purchases.push(purchase);
    this.save();
    return purchase;
  }

  getAll() {
    return this.purchases;
  }

  sortByField(field, farmers) {
    if (field === 'date') {
      this.purchases.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (field === 'amount') {
      this.purchases.sort((a, b) => a.totalCost - b.totalCost);
    } else if (field === 'farmer') {
      this.purchases.sort((a, b) => {
        const fA = farmers.find(f => f.id === a.farmerId)?.name || '';
        const fB = farmers.find(f => f.id === b.farmerId)?.name || '';
        return fA.localeCompare(fB);
      });
    }
  }

  generateSummary(filter) {
    const { farmerId, start, end } = filter;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    let filtered = this.purchases;

    if (farmerId) {
      filtered = filtered.filter(p => p.farmerId === farmerId);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(p => {
        const pDate = new Date(p.date);
        return pDate >= startDate && pDate <= endDate;
      });
    } else if (startDate && !endDate) {
      filtered = filtered.filter(p => new Date(p.date) >= startDate);
    } else if (!startDate && endDate) {
      filtered = filtered.filter(p => new Date(p.date) <= endDate);
    }

    let totalQuantity = 0;
    let totalCost = 0;
    filtered.forEach(p => {
      totalQuantity += p.quantity;
      totalCost += p.totalCost;
    });

    return {
      count: filtered.length,
      totalQuantity,
      totalCost
    };
  }
}

class ExpenseCalculator {
  constructor(purchases) {
    this.purchases = purchases;
  }
  calculate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;
    this.purchases.forEach(p => {
      const pDate = new Date(p.date);
      if (pDate >= start && pDate <= end) {
        total += p.totalCost;
      }
    });
    return total;
  }
}

class Category {
  constructor(id, name, weight, price, reorderThreshold = 10, stock = 0) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.price = price;
    this.reorderThreshold = reorderThreshold;
    this.stock = stock;
  }
}

class CategoriesManager {
  constructor() {
    this.load();
  }
  load() {
    let data = localStorage.getItem('categories');
    if (!data) {
      const defaultCategories = [
        new Category(1, "Small", "100g", 5.00, 10, 50),
        new Category(2, "Medium", "250g", 10.00, 10, 30),
        new Category(3, "Large", "500g", 18.00, 10, 20),
        new Category(4, "Extra Large", "1kg", 30.00, 5, 10),
        new Category(5, "Family Pack", "2kg", 50.00, 5, 5),
        new Category(6, "Bulk Pack", "5kg", 100.00, 2, 2),
        new Category(7, "Premium", "Custom", 0.00, 5, 0)
      ];
      this.categories = defaultCategories;
      this.save();
    } else {
      this.categories = JSON.parse(data);
    }
  }
  save() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }
  updatePrice(id, newPrice) {
    const cat = this.categories.find(c => c.id == id);
    if (cat) {
      cat.price = Number(newPrice);
      this.save();
    }
  }
  updateThreshold(id, newThreshold) {
    const cat = this.categories.find(c => c.id == id);
    if (cat) {
      cat.reorderThreshold = Number(newThreshold);
      this.save();
    }
  }
  updateStock(id, change) {
    const cat = this.categories.find(c => c.id == id);
    if (cat) {
      cat.stock = cat.stock + Number(change);
      if (cat.stock < 0) cat.stock = 0;
      this.save();
    }
  }
  getAll() {
    return this.categories;
  }
}

class Order {
  constructor(id, orderDate, customerName, customerContact, shippingInfo, categoryId, quantity, unitPrice, status) {
    this.id = id;
    this.orderDate = orderDate;
    this.customerName = customerName;
    this.customerContact = customerContact;
    this.shippingInfo = shippingInfo;
    this.categoryId = categoryId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = this.unitPrice * this.quantity;
    this.status = status;
  }
}

class OrdersManager {
  constructor() {
    this.load();
  }
  load() {
    const data = localStorage.getItem('orders');
    this.orders = data ? JSON.parse(data) : [];
  }
  save() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }
  addOrder(orderDate, customerName, customerContact, shippingInfo, categoryId, quantity, unitPrice, status) {
    const order = new Order(Date.now(), orderDate, customerName, customerContact, shippingInfo, categoryId, quantity, unitPrice, status);
    this.orders.push(order);
    this.save();
    return order;
  }
  updateOrderStatus(id, newStatus) {
    const order = this.orders.find(o => o.id == id);
    if (order) {
      order.status = newStatus;
      this.save();
    }
  }
  filterOrders({customerName = '', categoryId = '', status = ''}, categories) {
    const cname = customerName.toLowerCase();
    return this.orders.filter(o => {
      let match = true;
      if (cname && !o.customerName.toLowerCase().includes(cname)) match = false;
      if (categoryId && o.categoryId != categoryId) match = false;
      if (status && o.status != status) match = false;
      return match;
    });
  }
  getAll() { return this.orders; }
  generateSalesReport(categories) {
    const report = {
      perCategory: {},
      totalRevenue: 0,
      totalUnits: 0
    };
    categories.forEach(cat => {
      report.perCategory[cat.id] = {name: cat.name, units: 0, revenue: 0};
    });

    this.orders.forEach(o => {
      const catReport = report.perCategory[o.categoryId];
      if (catReport) {
        catReport.units += o.quantity;
        catReport.revenue += o.totalPrice;
        report.totalRevenue += o.totalPrice;
        report.totalUnits += o.quantity;
      }
    });
    return report;
  }
}

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
      const item = this.inventoryItems.find(i => i.id == id);
      if (item) {
        item.category = category;
        item.quantityAvailable = Number(quantityAvailable);
        item.reorderLevel = Number(reorderLevel);
        item.restockDate = restockDate;
        item.storageLocation = storageLocation;
      }
    } else {
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
  itemsNeedingReorder() {
    return this.inventoryItems.filter(i => i.quantityAvailable < i.reorderLevel);
  }
  demandForecast(ordersManager) {
    const allOrders = ordersManager.getAll();
    const last5 = allOrders.slice(-5);
    const prev5 = allOrders.slice(-10, -5);
    const last5Sum = last5.reduce((sum, o) => sum + o.quantity, 0);
    const prev5Sum = prev5.reduce((sum, o) => sum + o.quantity, 0);

    let message = "Demand is stable.";
    if (prev5Sum !== 0) {
      if (last5Sum > prev5Sum) {
        message = "Demand is increasing. Consider increasing reorder levels.";
      } else if (last5Sum < prev5Sum) {
        message = "Demand is decreasing. You might reduce stock levels.";
      }
    }

    const needsReorder = this.itemsNeedingReorder();
    if (needsReorder.length > 0) {
      message += "<br>Items below reorder level: " + needsReorder.map(i=>i.category).join(", ") + ". Consider reordering.";
    }
    return message;
  }
  generateInventoryReport(period) {
    const all = this.getAll();
    const totalStock = all.reduce((sum, i) => sum + i.quantityAvailable, 0);
    const needingReorder = this.itemsNeedingReorder().length;
    return `For the selected ${period} period: Total Stock: ${totalStock} kg. Items below reorder: ${needingReorder}.`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const farmersManager = new FarmersManager();
  const purchasesManager = new PurchasesManager();
  const categoriesManager = new CategoriesManager();
  const ordersManager = new OrdersManager();
  const inventoryManager = new InventoryManager();

  const farmerForm = document.getElementById('farmer-form');
  const farmersTableBody = document.querySelector('#farmers-table tbody');
  const farmerSearch = document.getElementById('farmer-search');
  const exportFarmersBtn = document.getElementById('export-farmers');

  const purchaseForm = document.getElementById('purchase-form');
  const purchaseFarmerSelect = purchaseForm.querySelector('select[name="farmerId"]');
  const purchasesTableBody = document.querySelector('#purchases-table tbody');
  const sortButtons = document.querySelectorAll('.sort-purchase');

  const expenseForm = document.getElementById('expense-form');
  const totalExpensesEl = document.getElementById('total-expenses');

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

  const packagingForm = document.getElementById('packaging-form');
  const packagingResult = document.getElementById('packaging-result');

  const orderForm = document.getElementById('order-form');
  const ordersTableBody = document.querySelector('#orders-table tbody');
  const orderSearchCustomer = document.getElementById('order-search-customer');
  const orderFilterCategory = document.getElementById('order-filter-category');
  const orderFilterStatus = document.getElementById('order-filter-status');
  const filterOrdersBtn = document.getElementById('filter-orders');
  const generateSalesReportBtn = document.getElementById('generate-sales-report');
  const exportSalesReportBtn = document.getElementById('export-sales-report');
  const salesReportDiv = document.getElementById('sales-report');

  const financialForm = document.getElementById('financial-form');
  const financialIncomeEl = document.getElementById('financial-income');
  const financialExpensesEl = document.getElementById('financial-expenses');
  const financialTaxEl = document.getElementById('financial-tax');
  const financialNetProfitEl = document.getElementById('financial-net-profit');

  const inventoryItemForm = document.getElementById('inventory-item-form');
  const inventoryItemsTableBody = document.querySelector('#inventory-items-table tbody');
  const demandForecastingBtn = document.getElementById('demand-forecasting-btn');
  const demandForecastingResult = document.getElementById('demand-forecasting-result');
  const inventoryReportPeriod = document.getElementById('inventory-report-period');
  const generateInventoryReportBtn = document.getElementById('generate-inventory-report');
  const inventoryReportDiv = document.getElementById('inventory-report');

  const comprehensiveReportForm = document.getElementById('comprehensive-report-form');
  const comprehensiveReportResult = document.getElementById('comprehensive-report-result');
  const exportComprehensiveReportBtn = document.getElementById('export-comprehensive-report');

  const purchaseSummaryForm = document.getElementById('purchase-summary-form');
  const purchaseSummaryResult = document.getElementById('purchase-summary-result');

  // RENDER FUNCTIONS & EVENT HANDLERS

  function renderFarmers(farmers) {
    farmersTableBody.innerHTML = '';
    farmers.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.id}</td>
        <td>${f.name}</td>
        <td>${f.phone}</td>
        <td>${f.email}</td>
        <td>${f.address}</td>
        <td>${f.region}</td>
        <td>${f.gpsCoordinates}</td>
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
  }

  function renderPurchases() {
    const farmers = farmersManager.getAll();
    const purchases = purchasesManager.getAll();
    purchasesTableBody.innerHTML = '';
    purchases.forEach(p => {
      const farmerObj = farmers.find(f => f.id === p.farmerId);
      const farmerName = farmerObj ? farmerObj.name : 'Unknown';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${farmerName}</td>
        <td>${p.date}</td>
        <td>${p.quantity.toFixed(2)}</td>
        <td>${p.pricePerKg.toFixed(2)}</td>
        <td>${p.totalCost.toFixed(2)}</td>
      `;
      purchasesTableBody.appendChild(tr);
    });
  }

  // Summaries for purchases
  purchaseSummaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(purchaseSummaryForm);
    const farmerId = formData.get('farmerId');
    const start = formData.get('start');
    const end = formData.get('end');

    const filter = {};
    if (farmerId) filter.farmerId = Number(farmerId);
    if (start) filter.start = start;
    if (end) filter.end = end;

    const summary = purchasesManager.generateSummary(filter);
    let html = `<p>Total Purchases: ${summary.count}</p>`;
    html += `<p>Total Quantity: ${summary.totalQuantity.toFixed(2)} kg</p>`;
    html += `<p>Total Cost: $${summary.totalCost.toFixed(2)}</p>`;

    purchaseSummaryResult.innerHTML = html;
  });

  // Populate farmer selects for purchases and summaries
  function populateFarmerSelects() {
    const farmers = farmersManager.getAll();
    // Purchase Form farmer select
    purchaseFarmerSelect.innerHTML = '<option value="">Select Farmer</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      purchaseFarmerSelect.appendChild(opt);
    });

    // Summary form farmer select
    const summaryFarmerSelect = document.querySelector('#purchase-summary-form select[name="farmerId"]');
    summaryFarmerSelect.innerHTML = '<option value="">All Farmers</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      summaryFarmerSelect.appendChild(opt);
    });
  }

  // Farmer form submit
  farmerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(farmerForm);
    const id = formData.get('id');
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const address = formData.get('address');
    const region = formData.get('region');
    const gps = formData.get('gpsCoordinates');

    const error = validateFarmerInputs(name, phone, email, address, region, gps);
    if (error) {
      alert(error);
      return;
    }

    if (id) {
      farmersManager.updateFarmer(id, name, phone, email, address, region, gps);
    } else {
      farmersManager.addFarmer(name, phone, email, address, region, gps);
    }

    farmerForm.reset();
    loadFarmers(farmerSearch.value);
    populateFarmerSelects(); // Update farmer selects after adding/updating
  });

  farmersTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-farmer')) {
      const id = e.target.dataset.id;
      farmersManager.deleteFarmer(id);
      loadFarmers(farmerSearch.value);
      populateFarmerSelects();
    } else if (e.target.classList.contains('edit-farmer')) {
      const id = e.target.dataset.id;
      const farmer = farmersManager.getAll().find(f => f.id == id);
      if (farmer) {
        farmerForm.elements['id'].value = farmer.id;
        farmerForm.elements['name'].value = farmer.name;
        farmerForm.elements['phone'].value = farmer.phone;
        farmerForm.elements['email'].value = farmer.email;
        farmerForm.elements['address'].value = farmer.address;
        farmerForm.elements['region'].value = farmer.region;
        farmerForm.elements['gpsCoordinates'].value = farmer.gpsCoordinates;
      }
    }
  });

  farmerSearch.addEventListener('input', () => {
    loadFarmers(farmerSearch.value);
  });

  exportFarmersBtn.addEventListener('click', () => {
    const farmers = farmersManager.getAll();
    let csv = "FarmerID,Name,Phone,Email,Address,Region,GPS\n";
    farmers.forEach(f => {
      csv += `${f.id},${f.name},${f.phone},${f.email},${f.address},${f.region},${f.gpsCoordinates}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "farmers.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Purchase form submit
  purchaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(purchaseForm);
    const farmerId = formData.get('farmerId');
    const date = formData.get('date');
    const quantity = formData.get('quantity');
    const pricePerKg = formData.get('pricePerKg');

    if (!farmerId) {
      alert("Please select a farmer before adding a purchase.");
      return;
    }

    // Ensure at least one farmer is present
    if (farmersManager.getAll().length === 0) {
      alert("No farmers available. Please add a farmer first.");
      return;
    }

    purchasesManager.addPurchase(farmerId, date, quantity, pricePerKg);
    purchaseForm.reset();
    renderPurchases();
  });

  // Purchase Sorting
  sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sortField = btn.dataset.sort;
      purchasesManager.sortByField(sortField, farmersManager.getAll());
      renderPurchases();
    });
  });

  // Expense form submit
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(expenseForm);
    const start = formData.get('start');
    const end = formData.get('end');
    calculateExpenses(start, end);
  });

  function calculateExpenses(start, end) {
    const calculator = new ExpenseCalculator(purchasesManager.getAll());
    const total = calculator.calculate(start, end);
    totalExpensesEl.textContent = total.toFixed(2);
  }

  // Render Categories
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

  // Render Inventory
  function renderInventory() {
    const categories = categoriesManager.getAll();
    inventoryTableBody.innerHTML = '';
    categorySelectForThreshold.innerHTML = '<option value="">Select Category</option>';
    categorySelectForStock.innerHTML = '<option value="">Select Category</option>';
    categorySelectForCalc.innerHTML = '<option value="">Select Category</option>';
    orderFilterCategory.innerHTML = '<option value="">All Package Categories</option>';

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
      orderFilterCategory.appendChild(opt4);
    });
  }

  // Render Orders
  function renderOrders(orders) {
    const categories = categoriesManager.getAll();
    ordersTableBody.innerHTML = '';
    orders.forEach(o => {
      const cat = categories.find(c => c.id == o.categoryId);
      const categoryName = cat ? cat.name : 'Unknown';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.customerContact}</td>
        <td>${o.shippingInfo}</td>
        <td>${categoryName}</td>
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

  function calculateFinancialAnalysis(startDate, endDate, taxRate) {
    const orders = ordersManager.getAll();
    const purchases = purchasesManager.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let income = 0;
    orders.forEach(o => {
      const oDate = new Date(o.orderDate);
      if (oDate >= start && oDate <= end) {
        income += o.totalPrice;
      }
    });

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

  function renderInventoryItems() {
    const items = inventoryManager.getAll();
    inventoryItemsTableBody.innerHTML = '';
    items.forEach(i => {
      const tr = document.createElement('tr');
      const belowReorder = i.quantityAvailable < i.reorderLevel;
      tr.classList.toggle('low-stock', belowReorder);
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

  function showDemandForecast() {
    const message = inventoryManager.demandForecast(ordersManager);
    demandForecastingResult.innerHTML = message;
  }

  function showInventoryReport() {
    const period = inventoryReportPeriod.value;
    const reportMsg = inventoryManager.generateInventoryReport(period);
    inventoryReportDiv.innerHTML = reportMsg;
  }

  function generateComprehensiveReport(startDate, endDate, taxRate) {
    const orders = ordersManager.getAll();
    const purchases = purchasesManager.getAll();
    const categories = categoriesManager.getAll();

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredOrders = orders.filter(o => {
      const oDate = new Date(o.orderDate);
      return oDate >= start && oDate <= end;
    });
    const filteredPurchases = purchases.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= start && pDate <= end;
    });

    let income = 0;
    const categorySales = {};
    categories.forEach(c => { categorySales[c.id] = { name: c.name, units: 0 }; });

    filteredOrders.forEach(o => {
      income += o.totalPrice;
      if (categorySales[o.categoryId]) {
        categorySales[o.categoryId].units += o.quantity;
      }
    });

    let expenses = 0;
    filteredPurchases.forEach(p => {
      expenses += p.totalCost;
    });

    const tax = income * taxRate;
    const netProfit = income - expenses - tax;

    const categoryStockInfo = categories.map(c => {
      return {name: c.name, stock: c.stock};
    });

    return {
      income,
      expenses,
      tax,
      netProfit,
      categorySales,
      categoryStockInfo,
      startDate,
      endDate,
      taxRate
    };
  }

  function displayComprehensiveReport(report) {
    let html = `<h4>Comprehensive Report (${report.startDate} to ${report.endDate})</h4>`;
    html += `<p><strong>Income:</strong> $${report.income.toFixed(2)}</p>`;
    html += `<p><strong>Expenses:</strong> $${report.expenses.toFixed(2)}</p>`;
    html += `<p><strong>Tax (${(report.taxRate*100).toFixed(2)}%):</strong> $${report.tax.toFixed(2)} (Applied correctly to income)</p>`;
    html += `<p><strong>Net Profit:</strong> $${report.netProfit.toFixed(2)}</p>`;

    html += `<h5>Units Sold per Category</h5>`;
    html += `<table border="1" cellpadding="5"><tr><th>Category</th><th>Units Sold</th></tr>`;
    for (let catId in report.categorySales) {
      const c = report.categorySales[catId];
      html += `<tr><td>${c.name}</td><td>${c.units}</td></tr>`;
    }
    html += `</table>`;

    html += `<h5>Current Stock per Category</h5>`;
    html += `<table border="1" cellpadding="5"><tr><th>Category</th><th>Stock</th></tr>`;
    report.categoryStockInfo.forEach(ci => {
      html += `<tr><td>${ci.name}</td><td>${ci.stock}</td></tr>`;
    });
    html += `</table>`;

    comprehensiveReportResult.innerHTML = html;
    exportComprehensiveReportBtn.style.display = 'inline-block';
    exportComprehensiveReportBtn.dataset.report = JSON.stringify(report);
  }

  function exportComprehensiveReportCSV(report) {
    let csv = `Comprehensive Report,${report.startDate} to ${report.endDate}\n`;
    csv += `Income,${report.income.toFixed(2)}\n`;
    csv += `Expenses,${report.expenses.toFixed(2)}\n`;
    csv += `Tax (${(report.taxRate*100).toFixed(2)}%),${report.tax.toFixed(2)}\n`;
    csv += `Net Profit,${report.netProfit.toFixed(2)}\n\n`;

    csv += `Units Sold per Category\n`;
    csv += `Category,Units Sold\n`;
    for (let catId in report.categorySales) {
      const c = report.categorySales[catId];
      csv += `${c.name},${c.units}\n`;
    }

    csv += `\nCurrent Stock per Category\n`;
    csv += `Category,Stock\n`;
    report.categoryStockInfo.forEach(ci => {
      csv += `${ci.name},${ci.stock}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "comprehensive_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Populate farmer dropdowns for purchase and summary
  function populateFarmerSelects() {
    const farmers = farmersManager.getAll();
    // Purchase Form farmer select
    purchaseFarmerSelect.innerHTML = '<option value="">Select Farmer</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      purchaseFarmerSelect.appendChild(opt);
    });

    // Summary form farmer select
    const summaryFarmerSelect = document.querySelector('#purchase-summary-form select[name="farmerId"]');
    summaryFarmerSelect.innerHTML = '<option value="">All Farmers</option>';
    farmers.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      summaryFarmerSelect.appendChild(opt);
    });
  }

  // Populate Cost Calculator Category Select
  function populateCostCalculatorCategorySelect() {
    const categorySelect = costCalcForm.querySelector('select[name="categoryId"]');
    const categories = categoriesManager.getAll();
    
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  }

  // Populate Inventory Item Selects
  function populateInventoryItemSelects() {
    const inventoryItemSelect = packagingForm.querySelector('select[name="inventoryItemId"]');
    const inventoryItems = inventoryManager.getAll();
    
    // Clear existing options
    inventoryItemSelect.innerHTML = '<option value="">Select Inventory Item</option>';
    
    inventoryItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.category} (ID: ${item.id}) - ${item.quantityAvailable} kg available`;
      inventoryItemSelect.appendChild(option);
    });
  }

  // Populate Order Form Category Select
  function populateOrderFormCategorySelect() {
    const categories = categoriesManager.getAll();
    const categorySelect = orderForm.querySelector('select[name="categoryId"]');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

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

    let weightStr = cat.weight.toLowerCase();
    let weightKg;
    if (weightStr.includes('g')) {
      const grams = parseFloat(weightStr);
      weightKg = grams / 1000;
    } else if (weightStr.includes('kg')) {
      weightKg = parseFloat(weightStr);
    } else {
      weightKg = 1;
    }

    const totalNeeded = weightKg * unitsToPackage;

    if (item.quantityAvailable < totalNeeded) {
      packagingResult.innerHTML = `<p style='color:red;'>Not enough raw inventory. Needed ${totalNeeded} kg, but only ${item.quantityAvailable} kg available.</p>`;
      return;
    }

    item.quantityAvailable -= totalNeeded;
    inventoryManager.save();

    categoriesManager.updateStock(categoryId, unitsToPackage);

    packagingResult.innerHTML = `<p style='color:green;'>Successfully packaged ${unitsToPackage} units of ${cat.name}, using ${totalNeeded} kg of ${item.category}.</p>`;

    checkForLowStockAlerts();
    renderInventoryItems();
    renderCategories();
    renderInventory();
    populateInventoryItemSelects(); // Refresh inventory items dropdown
  });

  function checkForLowStockAlerts() {
    const categories = categoriesManager.getAll();
    const lowStockCategories = categories.filter(c => c.stock < c.reorderThreshold);

    if (lowStockCategories.length > 0) {
      let msg = "<p style='color:orange; font-weight:bold;'>Alert: The following categories are below their reorder threshold:</p><ul>";
      lowStockCategories.forEach(c => {
        msg += `<li>${c.name}: Stock=${c.stock}, Reorder Threshold=${c.reorderThreshold}</li>`;
      });
      msg += "</ul><p>Please consider reordering from suppliers to maintain sufficient inventory.</p>";
      packagingResult.innerHTML += msg;
    }
  }

  function populateOrderFormCategorySelect() {
    const categories = categoriesManager.getAll();
    const categorySelect = orderForm.querySelector('select[name="categoryId"]');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName');
    const customerContact = formData.get('customerContact');
    const shippingInfo = formData.get('shippingInfo');
    const orderDate = formData.get('orderDate');
    const categoryId = formData.get('categoryId');
    const quantity = Number(formData.get('quantity'));
    const status = formData.get('status');

    const categories = categoriesManager.getAll();
    const cat = categories.find(c => c.id == categoryId);
    if (!cat) {
      alert("Invalid category selected.");
      return;
    }

    if (cat.stock < quantity) {
      alert(`Not enough stock in category ${cat.name}. Available: ${cat.stock}, Requested: ${quantity}`);
      return;
    }

    categoriesManager.updateStock(categoryId, -quantity);
    const unitPrice = cat.price;
    ordersManager.addOrder(orderDate, customerName, customerContact, shippingInfo, categoryId, quantity, unitPrice, status);
    orderForm.reset();
    filterAndRenderOrders();
    renderInventory();
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

  generateSalesReportBtn.addEventListener('click', () => {
    const report = generateSalesReport();
    exportSalesReportBtn.dataset.report = JSON.stringify(report);
  });

  exportSalesReportBtn.addEventListener('click', () => {
    const report = JSON.parse(exportSalesReportBtn.dataset.report);
    exportSalesReportCSV(report);
  });

  financialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(financialForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRate = parseFloat(formData.get('taxRate'));
    calculateFinancialAnalysis(start, end, taxRate);
  });

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
    populateInventoryItemSelects(); // Ensure the select is updated
  });

  inventoryItemsTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-inventory-item')) {
      const id = e.target.dataset.id;
      inventoryManager.deleteItem(id);
      renderInventoryItems();
      populateInventoryItemSelects(); // Refresh the inventory items dropdown
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

  demandForecastingBtn.addEventListener('click', showDemandForecast);
  generateInventoryReportBtn.addEventListener('click', showInventoryReport);

  comprehensiveReportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(comprehensiveReportForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRate = parseFloat(formData.get('taxRate'));
    const report = generateComprehensiveReport(start, end, taxRate);
    displayComprehensiveReport(report);
  });

  exportComprehensiveReportBtn.addEventListener('click', () => {
    const report = JSON.parse(exportComprehensiveReportBtn.dataset.report);
    exportComprehensiveReportCSV(report);
  });

  // INITIAL LOAD
  loadFarmers();
  renderPurchases();
  renderCategories();
  renderInventory();
  filterAndRenderOrders();
  renderInventoryItems();
  populateFarmerSelects();
  populateOrderFormCategorySelect();
  populateInventoryItemSelects(); // Populate Inventory Items Select on Load
  populateCostCalculatorCategorySelect(); // Populate Cost Calculator Category Select on Load
});
