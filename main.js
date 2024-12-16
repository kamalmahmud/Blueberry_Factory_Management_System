// ===== CLASSES =====

// Farmer Class
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

// FarmersManager Class
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
    const id = Date.now();
    const farmer = new Farmer(id, name, phone, email, address, region, gpsCoordinates);
    this.farmers.push(farmer);
    this.save();
  }

  updateFarmer(id, name, phone, email, address, region, gpsCoordinates) {
    const farmer = this.farmers.find(f => f.id == id);
    if (farmer) {
      farmer.name = name;
      farmer.phone = phone;
      farmer.email = email;
      farmer.address = address;
      farmer.region = region;
      farmer.gpsCoordinates = gpsCoordinates;
      this.save();
    }
  }

  deleteFarmer(id) {
    this.farmers = this.farmers.filter(f => f.id != id);
    this.save();
  }

  getAll() {
    return this.farmers;
  }

  search(query) {
    return this.farmers.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }
}

// Purchase Class
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

// PurchasesManager Class
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
    const id = Date.now();
    const purchase = new Purchase(id, farmerId, date, quantity, pricePerKg);
    this.purchases.push(purchase);
    this.save();
  }

  getAll() {
    return this.purchases;
  }

  sortByField(field, farmers) {
    this.purchases.sort((a, b) => {
      if (field === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (field === 'totalCost') {
        return a.totalCost - b.totalCost;
      }
      return 0;
    });
    this.save();
  }

  generateSummary(filter) {
    let filtered = this.purchases;
    if (filter.farmerId) {
      filtered = filtered.filter(p => p.farmerId == filter.farmerId);
    }
    if (filter.start) {
      const startDate = new Date(filter.start);
      filtered = filtered.filter(p => new Date(p.date) >= startDate);
    }
    if (filter.end) {
      const endDate = new Date(filter.end);
      filtered = filtered.filter(p => new Date(p.date) <= endDate);
    }

    const summary = {
      count: filtered.length,
      totalQuantity: filtered.reduce((acc, p) => acc + p.quantity, 0),
      totalCost: filtered.reduce((acc, p) => acc + p.totalCost, 0)
    };

    return summary;
  }
}

// ExpenseCalculator Class
class ExpenseCalculator {
  constructor(purchases) {
    this.purchases = purchases;
  }

  calculate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const totalExpenses = this.purchases
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate >= startDate && pDate <= endDate;
      })
      .reduce((acc, p) => acc + p.totalCost, 0);
    return totalExpenses;
  }
}

// Category Class
class Category {
  constructor(id, name, weight, price, stock = 0, reorderThreshold = 10) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.price = price;
    this.stock = stock;
    this.reorderThreshold = reorderThreshold;
  }
}

// CategoriesManager Class
class CategoriesManager {
  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('categories');
    this.categories = data ? JSON.parse(data) : [
      new Category(1, 'Small', '500g', 5),
      new Category(2, 'Medium', '1kg', 10),
      new Category(3, 'Large', '2kg', 18)
    ];
  }

  save() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  getAll() {
    return this.categories;
  }

  updatePrice(id, newPrice) {
    const category = this.categories.find(c => c.id == id);
    if (category) {
      category.price = newPrice;
      this.save();
    }
  }

  updateStock(id, quantity) {
    const category = this.categories.find(c => c.id == id);
    if (category) {
      category.stock += quantity;
      this.save();
    }
  }
}

// OrderItem Class
class OrderItem {
  constructor(categoryId, quantity, unitPrice) {
    this.categoryId = categoryId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = quantity * unitPrice;
  }
}

// Order Class
class Order {
  constructor(id, customerName, customerContact, shippingInfo, items) {
    this.id = id;
    this.customerName = customerName;
    this.customerContact = customerContact;
    this.shippingInfo = shippingInfo;
    this.items = items; // Array of OrderItem
    this.totalCost = items.reduce((acc, item) => acc + item.totalPrice, 0);
    this.status = 'Pending';
    this.orderDate = new Date().toISOString().split('T')[0];
  }
}

// OrdersManager Class
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

  addOrder(customerName, customerContact, shippingInfo, items) {
    const id = Date.now();
    const order = new Order(id, customerName, customerContact, shippingInfo, items);
    this.orders.push(order);
    this.save();
  }

  getAll() {
    return this.orders;
  }

  updateOrderStatus(id, newStatus) {
    const order = this.orders.find(o => o.id == id);
    if (order) {
      order.status = newStatus;
      this.save();
    }
  }

  filterOrders(filters, categories) {
    return this.orders.filter(o => {
      const matchesCustomer = filters.customerName ? o.customerName.toLowerCase().includes(filters.customerName.toLowerCase()) : true;
      const matchesStatus = filters.status ? o.status === filters.status : true;
      const matchesCategory = filters.categoryId ? o.items.some(item => item.categoryId == filters.categoryId) : true;
      return matchesCustomer && matchesStatus && matchesCategory;
    });
  }

  generateSalesReport(categories) {
    const report = {
      totalUnits: 0,
      totalRevenue: 0,
      perCategory: {}
    };

    categories.forEach(c => {
      report.perCategory[c.id] = { name: c.name, units: 0, revenue: 0 };
    });

    this.orders.forEach(o => {
      o.items.forEach(item => {
        report.totalUnits += item.quantity;
        report.totalRevenue += item.totalPrice;
        if (report.perCategory[item.categoryId]) {
          report.perCategory[item.categoryId].units += item.quantity;
          report.perCategory[item.categoryId].revenue += item.totalPrice;
        }
      });
    });

    return report;
  }
}

// InventoryItem Class
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

// InventoryManager Class
class InventoryManager {
  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('inventory');
    this.inventory = data ? JSON.parse(data) : [];
  }

  save() {
    localStorage.setItem('inventory', JSON.stringify(this.inventory));
  }

  addOrUpdateItem(id, category, quantityAvailable, reorderLevel, restockDate, storageLocation) {
    if (id) {
      const item = this.inventory.find(i => i.id == id);
      if (item) {
        item.category = category;
        item.quantityAvailable = parseFloat(quantityAvailable);
        item.reorderLevel = parseInt(reorderLevel, 10);
        item.restockDate = restockDate;
        item.storageLocation = storageLocation;
        this.save();
      }
    } else {
      const newId = Date.now();
      const newItem = new InventoryItem(newId, category, parseFloat(quantityAvailable), parseInt(reorderLevel, 10), restockDate, storageLocation);
      this.inventory.push(newItem);
      this.save();
    }
  }

  deleteItem(id) {
    this.inventory = this.inventory.filter(i => i.id != id);
    this.save();
  }

  getAll() {
    return this.inventory;
  }

  demandForecast(ordersManager) {
    // Simple demand forecast based on past orders
    const orders = ordersManager.getAll();
    const demand = {};

    orders.forEach(o => {
      o.items.forEach(item => {
        if (!demand[item.categoryId]) {
          demand[item.categoryId] = 0;
        }
        demand[item.categoryId] += item.quantity;
      });
    });

    let message = "<h4>Demand Forecast</h4><ul>";
    for (let catId in demand) {
      message += `<li>Category ID ${catId}: Estimated Demand ${demand[catId]} units</li>`;
    }
    message += "</ul>";
    return message;
  }

  generateInventoryReport(period) {
    // Placeholder for inventory report generation based on the period
    return `<p>Inventory report for the period: ${period}</p>`;
  }
}

// TaxRateManager Class
class TaxRateManager {
  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('taxRates');
    this.taxRates = data ? JSON.parse(data) : [{ id: 1, name: 'Standard Tax', rate: 0.15 }]; // Default 15%
  }

  save() {
    localStorage.setItem('taxRates', JSON.stringify(this.taxRates));
  }

  getAll() {
    return this.taxRates;
  }

  addTaxRate(name, rate) {
    const id = Date.now();
    this.taxRates.push({ id, name, rate });
    this.save();
    return id;
  }

  updateTaxRate(id, name, rate) {
    const taxRate = this.taxRates.find(t => t.id == id);
    if (taxRate) {
      taxRate.name = name;
      taxRate.rate = rate;
      this.save();
      return true;
    }
    return false;
  }

  deleteTaxRate(id) {
    this.taxRates = this.taxRates.filter(t => t.id != id);
    this.save();
  }

  getTaxRate(id) {
    const taxRate = this.taxRates.find(t => t.id == id);
    return taxRate ? taxRate.rate : 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const farmersManager = new FarmersManager();
  const purchasesManager = new PurchasesManager();
  const categoriesManager = new CategoriesManager();
  const ordersManager = new OrdersManager();
  const inventoryManager = new InventoryManager();
  const taxRateManager = new TaxRateManager(); // Initialize TaxRateManager

  // Elements referencing from HTML
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
  const inventoryTableBody = document.querySelector('#inventory-items-table tbody');
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

  // Tax Rate Elements
  const taxRateForm = document.getElementById('tax-rate-form');
  const taxRatesTableBody = document.querySelector('#tax-rates-table tbody');
  const addTaxRateBtn = document.getElementById('add-tax-rate-btn');

  // Inventory Alert Elements
  const inventoryAlertsDiv = document.getElementById('inventory-alerts'); // Already in HTML

  // ===== HELPER FUNCTIONS =====

  // Validate Farmer Inputs
  function validateFarmerInputs(name, phone, email, address, region, gps) {
    if (!name || !phone || !email || !address || !region || !gps) {
      return "All fields are required.";
    }
    // Add more validations as needed (e.g., email format)
    return null;
  }

  // Populate Order Items (Dynamic Fields)
  const addOrderItemBtn = document.getElementById('add-order-item-btn');
  const orderItemsDiv = document.getElementById('orderItems');

  addOrderItemBtn.addEventListener('click', () => {
    const newItemDiv = document.createElement('div');
    newItemDiv.classList.add('order-item');
    newItemDiv.innerHTML = `
      <label for="itemCategory">Category:</label>
      <select name="itemCategory" class="orderItemCategory" required>
        <option value="">Select Category</option>
        <!-- Options populated via JavaScript -->
      </select>
      <label for="itemQuantity">Quantity:</label>
      <input type="number" name="itemQuantity" class="orderItemQuantity" min="1" step="1" required>
      <button type="button" class="remove-order-item-btn">Remove</button>
    `;
    orderItemsDiv.appendChild(newItemDiv);
  });

  orderItemsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-order-item-btn')) {
      e.target.parentElement.remove();
    }
  });

  // ===== RENDER FUNCTIONS =====

  // Render Farmers
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

  // Render Purchases
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

  // Render Purchase Summary
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

  // Populate Farmer Selects
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

  // Farmer Form Submission
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

  // Farmers Table Actions (Edit/Delete)
  farmersTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-farmer')) {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this farmer?")) {
        farmersManager.deleteFarmer(id);
        loadFarmers(farmerSearch.value);
        populateFarmerSelects();
      }
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

  // Farmer Search
  farmerSearch.addEventListener('input', () => {
    loadFarmers(farmerSearch.value);
  });

  // Export Farmers as CSV
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

  // Categories Form Submission (Update Price)
  categoryPriceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(categoryPriceForm);
    const categoryId = formData.get('categoryId');
    const newPrice = parseFloat(formData.get('price'));

    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }

    categoriesManager.updatePrice(categoryId, newPrice);
    categoryPriceForm.reset();
    renderCategories();
    renderInventoryItems(); // Update inventory display if prices affect it
  });

  // ===== Tax Rate Management =====

  // Render Tax Rates
  function renderTaxRates() {
    const taxRates = taxRateManager.getAll();
    taxRatesTableBody.innerHTML = '';
    taxRates.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${(t.rate * 100).toFixed(2)}%</td>
        <td>
          <button class="edit-tax-rate" data-id="${t.id}">Edit</button>
          <button class="delete-tax-rate" data-id="${t.id}">Delete</button>
        </td>
      `;
      taxRatesTableBody.appendChild(tr);
    });
  }

  // Tax Rate Form Submission (Add)
  taxRateForm.addEventListener('submit', (e) => {
    if (e.submitter.id === 'add-tax-rate-btn') {
      e.preventDefault();
      const formData = new FormData(taxRateForm);
      const name = formData.get('taxRateName');
      const rate = parseFloat(formData.get('taxRateValue')) / 100;

      if (!name || isNaN(rate) || rate < 0) {
        alert("Please provide a valid tax rate name and a non-negative rate.");
        return;
      }

      taxRateManager.addTaxRate(name, rate);
      taxRateForm.reset();
      renderTaxRates();
      renderFinancialTaxRateDropdown(); // Update dropdown in financial form
    }
  });

  // Handle Edit and Delete Tax Rates
  taxRatesTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-tax-rate')) {
      const id = e.target.dataset.id;
      const taxRate = taxRateManager.getAll().find(t => t.id == id);
      if (taxRate) {
        // Populate the form with existing data
        taxRateForm.elements['taxRateId'].value = taxRate.id;
        taxRateForm.elements['taxRateName'].value = taxRate.name;
        taxRateForm.elements['taxRateValue'].value = (taxRate.rate * 100).toFixed(2);
        // Show Update button and hide Add button
        document.getElementById('add-tax-rate-btn').style.display = 'none';
        document.getElementById('update-tax-rate-btn').style.display = 'inline-block';
      }
    } else if (e.target.classList.contains('delete-tax-rate')) {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this tax rate?")) {
        taxRateManager.deleteTaxRate(id);
        renderTaxRates();
        renderFinancialTaxRateDropdown(); // Update dropdown in financial form
      }
    }
  });

  // Update Tax Rate Form Submission (for editing)
  taxRateForm.addEventListener('submit', (e) => {
    if (e.submitter.id === 'update-tax-rate-btn') {
      e.preventDefault();
      const formData = new FormData(taxRateForm);
      const id = formData.get('taxRateId');
      const name = formData.get('taxRateName');
      const rate = parseFloat(formData.get('taxRateValue')) / 100;

      if (!name || isNaN(rate) || rate < 0) {
        alert("Please provide a valid tax rate name and a non-negative rate.");
        return;
      }

      taxRateManager.updateTaxRate(id, name, rate);
      taxRateForm.reset();
      renderTaxRates();
      document.getElementById('update-tax-rate-btn').style.display = 'none';
      document.getElementById('add-tax-rate-btn').style.display = 'inline-block';
      renderFinancialTaxRateDropdown(); // Update dropdown in financial form
    }
  });

  // Render Financial Tax Rate Dropdown
  function renderFinancialTaxRateDropdown() {
    const taxRateSelect = financialForm.querySelector('select[name="taxRateId"]');
    const taxRates = taxRateManager.getAll();
    taxRateSelect.innerHTML = '<option value="">Select Tax Rate</option>';
    taxRates.forEach(t => {
      taxRateSelect.innerHTML += `<option value="${t.id}">${t.name} (${(t.rate * 100).toFixed(2)}%)</option>`;
    });
  }

  // Render Tax Rates on Load
  renderTaxRates();

  // Re-render dropdown whenever tax rates change
  function handleTaxRateChange() {
    renderFinancialTaxRateDropdown();
  }

  taxRatesTableBody.addEventListener('click', handleTaxRateChange);
  taxRateForm.addEventListener('submit', handleTaxRateChange);
  taxRateForm.addEventListener('reset', handleTaxRateChange);

  // ===== Inventory Management =====

  // Render Inventory Items
  function renderInventoryItems() {
    const items = inventoryManager.getAll();
    inventoryItemsTableBody.innerHTML = '';
    items.forEach(i => {
      const tr = document.createElement('tr');
      const belowReorder = i.quantityAvailable < i.reorderLevel;
      tr.classList.toggle('low-stock-highlight', belowReorder);
      const restockSoon = i.restockDate && (new Date(i.restockDate) - new Date()) < 3 * 24 * 60 * 60 * 1000;
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

    // Highlight low-stock categories
    highlightLowStockCategories();
  }

  // Inventory Item Form Submission
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

  // Inventory Items Table Actions (Edit/Delete)
  inventoryItemsTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-inventory-item')) {
      const id = e.target.dataset.id;
      if (confirm("Are you sure you want to delete this inventory item?")) {
        inventoryManager.deleteItem(id);
        renderInventoryItems();
        populateInventoryItemSelects(); // Refresh the inventory items dropdown
      }
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

  // ===== Packaging =====

  // Populate Inventory Item Select
  function populateInventoryItemSelects() {
    const inventoryItems = inventoryManager.getAll();
    const inventoryItemSelect = document.getElementById('inventoryItemSelect');
    const packagingCategorySelect = document.getElementById('packagingCategorySelect');
    inventoryItemSelect.innerHTML = '<option value="">Select Inventory Item</option>';
    packagingCategorySelect.innerHTML = '<option value="">Select Category</option>';
    const categories = categoriesManager.getAll();
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      packagingCategorySelect.appendChild(opt);
    });
    inventoryItems.forEach(item => {
      inventoryItemSelect.innerHTML += `<option value="${item.id}">${item.category} (Available: ${item.quantityAvailable})</option>`;
    });
  }

  // Packaging Form Submission
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

    // Deduct raw inventory
    item.quantityAvailable -= totalNeeded;
    inventoryManager.save();

    // Add to packaged category stock
    categoriesManager.updateStock(categoryId, unitsToPackage);

    // Display success message with pricing
    const totalPrice = cat.price * unitsToPackage;
    packagingResult.innerHTML = `<p style='color:green;'>Successfully packaged ${unitsToPackage} units of ${cat.name}, using ${totalNeeded} kg of ${item.category}. Total Price: $${totalPrice.toFixed(2)}</p>`;

    // Check for low stock and trigger alerts if necessary
    checkForLowStockAlerts();

    renderInventoryItems();
    renderCategories();
    renderInventory();
    populateInventoryItemSelects(); // Refresh the inventory items dropdown
  });

  // ===== Orders Management =====

  // Render Orders
  function renderOrders(orders) {
    const categories = categoriesManager.getAll();
    ordersTableBody.innerHTML = '';
    orders.forEach(o => {
      let itemsDetails = '';
      o.items.forEach(item => {
        const cat = categories.find(c => c.id == item.categoryId);
        const catName = cat ? cat.name : 'Unknown';
        itemsDetails += `${catName} x${item.quantity} ($${item.unitPrice.toFixed(2)} each)<br>`;
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.customerName}</td>
        <td>${o.customerContact}</td>
        <td>${o.shippingInfo}</td>
        <td>${itemsDetails}</td>
        <td>$${o.totalCost.toFixed(2)}</td>
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

  // Filter and Render Orders
  function filterAndRenderOrders() {
    const filters = {
      customerName: orderSearchCustomer.value,
      status: orderFilterStatus.value,
      categoryId: orderFilterCategory.value
    };
    const filtered = ordersManager.filterOrders(filters, categoriesManager.getAll());
    renderOrders(filtered);
  }

  // Handle Order Status Update
  ordersTableBody.addEventListener('change', (e) => {
    if (e.target.classList.contains('update-order-status')) {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      ordersManager.updateOrderStatus(id, newStatus);
      alert(`Order ${id} status updated to ${newStatus}.`);
      renderOrders(ordersManager.getAll());
    }
  });

  // Handle Filter Orders Button
  filterOrdersBtn.addEventListener('click', filterAndRenderOrders);

  // Handle Order Form Submission
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(orderForm);
    const customerName = formData.get('customerName');
    const customerContact = formData.get('customerContact');
    const shippingInfo = formData.get('shippingInfo');

    const orderItems = [];
    const itemCategories = document.querySelectorAll('.orderItemCategory');
    const itemQuantities = document.querySelectorAll('.orderItemQuantity');

    for (let i = 0; i < itemCategories.length; i++) {
      const categoryId = parseInt(itemCategories[i].value, 10);
      const quantity = parseInt(itemQuantities[i].value, 10);
      if (isNaN(categoryId) || isNaN(quantity)) continue;
      const category = categoriesManager.getAll().find(c => c.id == categoryId);
      if (category) {
        orderItems.push(new OrderItem(categoryId, quantity, category.price));
      }
    }

    if (orderItems.length === 0) {
      alert("Please add at least one valid order item.");
      return;
    }

    ordersManager.addOrder(customerName, customerContact, shippingInfo, orderItems);
    orderForm.reset();
    renderOrders(ordersManager.getAll());
    populateOrderFormCategorySelect(); // Refresh category selects
  });

  // Populate Order Form Category Select
  function populateOrderFormCategorySelect() {
    const categories = categoriesManager.getAll();
    const orderItemCategories = document.querySelectorAll('.orderItemCategory');
    orderItemCategories.forEach(select => {
      select.innerHTML = '<option value="">Select Category</option>';
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
      });
    });

    // Also populate filter category select
    orderFilterCategory.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      orderFilterCategory.appendChild(opt);
    });
  }

  // ===== Sales Report =====

  // Generate Sales Report
  generateSalesReportBtn.addEventListener('click', () => {
    const report = ordersManager.generateSalesReport(categoriesManager.getAll());

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
    exportSalesReportBtn.style.display = 'inline-block';
    exportSalesReportBtn.dataset.report = JSON.stringify(report);
  });

  // Export Sales Report as CSV
  exportSalesReportBtn.addEventListener('click', () => {
    const report = JSON.parse(exportSalesReportBtn.dataset.report);
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
  });

  // ===== Financial Analysis =====

  // Financial Form Submission
  financialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(financialForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRateId = formData.get('taxRateId'); // Select tax rate from dropdown
    const taxRate = taxRateManager.getTaxRate(taxRateId) || 0;

    calculateFinancialAnalysis(start, end, taxRate);
  });

  // Calculate Financial Analysis
  function calculateFinancialAnalysis(startDate, endDate, taxRate) {
    const orders = ordersManager.getAll();
    const purchases = purchasesManager.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let income = 0;
    orders.forEach(o => {
      const oDate = new Date(o.orderDate);
      if (oDate >= start && oDate <= end) {
        income += o.totalCost;
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

    // Record Tax Liability
    recordTaxLiability(startDate, endDate, taxRate, tax);

    // Display confirmation message
    alert(`Tax Calculation Complete:
- Income: $${income.toFixed(2)}
- Expenses: $${expenses.toFixed(2)}
- Tax (${(taxRate * 100).toFixed(2)}%): $${tax.toFixed(2)}
- Net Profit: $${netProfit.toFixed(2)}`);
  }

  // Record Tax Liability
  function recordTaxLiability(startDate, endDate, taxRate, taxAmount) {
    let taxLiabilities = JSON.parse(localStorage.getItem('taxLiabilities')) || [];
    taxLiabilities.push({
      id: Date.now(),
      period: `${startDate} to ${endDate}`,
      taxRate: taxRate,
      taxAmount: taxAmount
    });
    localStorage.setItem('taxLiabilities', JSON.stringify(taxLiabilities));
  }

  // ===== Comprehensive Report =====

  // Render Comprehensive Report
  function renderComprehensiveReport(report) {
    let html = `<h4>Comprehensive Report (${report.startDate} to ${report.endDate})</h4>`;
    html += `<p><strong>Income:</strong> $${report.income.toFixed(2)}</p>`;
    html += `<p><strong>Expenses:</strong> $${report.expenses.toFixed(2)}</p>`;
    html += `<p><strong>Tax (${(report.taxRate * 100).toFixed(2)}%):</strong> $${report.tax.toFixed(2)} (Applied correctly to income)</p>`;
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
    for (let category in report.currentStock) {
      html += `<tr><td>${category}</td><td>${report.currentStock[category]}</td></tr>`;
    }
    html += `</table>`;

    comprehensiveReportResult.innerHTML = html;
    exportComprehensiveReportBtn.style.display = 'inline-block';
    exportComprehensiveReportBtn.dataset.report = JSON.stringify(report);
  }

  // Comprehensive Report Form Submission
  comprehensiveReportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(comprehensiveReportForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRateId = formData.get('taxRateId');
    const taxRate = taxRateManager.getTaxRate(taxRateId) || 0;
    const report = generateComprehensiveReport(start, end, taxRate);
    renderComprehensiveReport(report);
  });

  // Generate Comprehensive Report
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
      o.items.forEach(item => {
        income += item.totalPrice;
        if (categorySales[item.categoryId]) {
          categorySales[item.categoryId].units += item.quantity;
        }
      });
    });

    let expenses = 0;
    filteredPurchases.forEach(p => {
      expenses += p.totalCost;
    });

    const tax = income * taxRate;
    const netProfit = income - expenses - tax;

    const categoryStockInfo = categories.map(c => {
      return { name: c.name, stock: c.stock };
    });

    return {
      income,
      expenses,
      tax,
      netProfit,
      categorySales,
      currentStock: Object.fromEntries(
        categoryStockInfo.map(ci => [ci.name, ci.stock])
      ),
      startDate,
      endDate,
      taxRate
    };
  }

  // Export Comprehensive Report as CSV
  exportComprehensiveReportBtn.addEventListener('click', () => {
    const report = JSON.parse(exportComprehensiveReportBtn.dataset.report);
    let csv = `Comprehensive Report (${report.startDate} to ${report.endDate})\n\n`;
    csv += `Income,$${report.income.toFixed(2)}\n`;
    csv += `Expenses,$${report.expenses.toFixed(2)}\n`;
    csv += `Tax (${(report.taxRate * 100).toFixed(2)}%),$${report.tax.toFixed(2)}\n`;
    csv += `Net Profit,$${report.netProfit.toFixed(2)}\n\n`;

    csv += `Units Sold per Category\n`;
    csv += `Category,Units Sold\n`;
    for (let catId in report.categorySales) {
      const c = report.categorySales[catId];
      csv += `${c.name},${c.units}\n`;
    }
    csv += `\n`;

    csv += `Current Stock per Category\n`;
    csv += `Category,Stock\n`;
    for (let category in report.currentStock) {
      csv += `${category},${report.currentStock[category]}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_report_${report.startDate}_to_${report.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // ===== Inventory Report =====
  // Placeholder for inventory report generation based on the period
  // Can be implemented similarly to sales and comprehensive reports

  // ===== Demand Forecasting =====
  function showDemandForecast() {
    const message = inventoryManager.demandForecast(ordersManager);
    demandForecastingResult.innerHTML = message;
  }

  demandForecastingBtn.addEventListener('click', showDemandForecast);

  // ===== Financial Analysis =====

  // Financial Form Submission
  financialForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(financialForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRateId = formData.get('taxRateId'); // Select tax rate from dropdown
    const taxRate = taxRateManager.getTaxRate(taxRateId) || 0;

    calculateFinancialAnalysis(start, end, taxRate);
  });

  // Calculate Financial Analysis
  function calculateFinancialAnalysis(startDate, endDate, taxRate) {
    const orders = ordersManager.getAll();
    const purchases = purchasesManager.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);

    let income = 0;
    orders.forEach(o => {
      const oDate = new Date(o.orderDate);
      if (oDate >= start && oDate <= end) {
        income += o.totalCost;
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

    // Record Tax Liability
    recordTaxLiability(startDate, endDate, taxRate, tax);

    // Display confirmation message
    alert(`Tax Calculation Complete:
- Income: $${income.toFixed(2)}
- Expenses: $${expenses.toFixed(2)}
- Tax (${(taxRate * 100).toFixed(2)}%): $${tax.toFixed(2)}
- Net Profit: $${netProfit.toFixed(2)}`);
  }

  // Record Tax Liability
  function recordTaxLiability(startDate, endDate, taxRate, taxAmount) {
    let taxLiabilities = JSON.parse(localStorage.getItem('taxLiabilities')) || [];
    taxLiabilities.push({
      id: Date.now(),
      period: `${startDate} to ${endDate}`,
      taxRate: taxRate,
      taxAmount: taxAmount
    });
    localStorage.setItem('taxLiabilities', JSON.stringify(taxLiabilities));
  }

  // ===== Comprehensive Report =====

  // Render Comprehensive Report
  function renderComprehensiveReport(report) {
    let html = `<h4>Comprehensive Report (${report.startDate} to ${report.endDate})</h4>`;
    html += `<p><strong>Income:</strong> $${report.income.toFixed(2)}</p>`;
    html += `<p><strong>Expenses:</strong> $${report.expenses.toFixed(2)}</p>`;
    html += `<p><strong>Tax (${(report.taxRate * 100).toFixed(2)}%):</strong> $${report.tax.toFixed(2)} (Applied correctly to income)</p>`;
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
    for (let category in report.currentStock) {
      html += `<tr><td>${category}</td><td>${report.currentStock[category]}</td></tr>`;
    }
    html += `</table>`;

    comprehensiveReportResult.innerHTML = html;
    exportComprehensiveReportBtn.style.display = 'inline-block';
    exportComprehensiveReportBtn.dataset.report = JSON.stringify(report);
  }

  // Comprehensive Report Form Submission
  comprehensiveReportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(comprehensiveReportForm);
    const start = formData.get('start');
    const end = formData.get('end');
    const taxRateId = formData.get('taxRateId');
    const taxRate = taxRateManager.getTaxRate(taxRateId) || 0;
    const report = generateComprehensiveReport(start, end, taxRate);
    renderComprehensiveReport(report);
  });

  // Generate Comprehensive Report
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
      o.items.forEach(item => {
        income += item.totalPrice;
        if (categorySales[item.categoryId]) {
          categorySales[item.categoryId].units += item.quantity;
        }
      });
    });

    let expenses = 0;
    filteredPurchases.forEach(p => {
      expenses += p.totalCost;
    });

    const tax = income * taxRate;
    const netProfit = income - expenses - tax;

    const categoryStockInfo = categories.map(c => {
      return { name: c.name, stock: c.stock };
    });

    return {
      income,
      expenses,
      tax,
      netProfit,
      categorySales,
      currentStock: Object.fromEntries(
        categoryStockInfo.map(ci => [ci.name, ci.stock])
      ),
      startDate,
      endDate,
      taxRate
    };
  }

  // Export Comprehensive Report as CSV
  exportComprehensiveReportBtn.addEventListener('click', () => {
    const report = JSON.parse(exportComprehensiveReportBtn.dataset.report);
    let csv = `Comprehensive Report (${report.startDate} to ${report.endDate})\n\n`;
    csv += `Income,$${report.income.toFixed(2)}\n`;
    csv += `Expenses,$${report.expenses.toFixed(2)}\n`;
    csv += `Tax (${(report.taxRate * 100).toFixed(2)}%),$${report.tax.toFixed(2)}\n`;
    csv += `Net Profit,$${report.netProfit.toFixed(2)}\n\n`;

    csv += `Units Sold per Category\n`;
    csv += `Category,Units Sold\n`;
    for (let catId in report.categorySales) {
      const c = report.categorySales[catId];
      csv += `${c.name},${c.units}\n`;
    }
    csv += `\n`;

    csv += `Current Stock per Category\n`;
    csv += `Category,Stock\n`;
    for (let category in report.currentStock) {
      csv += `${category},${report.currentStock[category]}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_report_${report.startDate}_to_${report.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // ===== Report Generation =====

  // Populate Inventory Item Selects on Load
  populateInventoryItemSelects();

  // ===== Initial Load Functions =====

  loadFarmers();
  renderFarmers(farmersManager.getAll());
  renderPurchases();
  renderCategories();
  renderInventoryItems();
  populateFarmerSelects();
  populateOrderFormCategorySelect(); // Populate categories in order form
  renderFinancialTaxRateDropdown(); // Populate tax rate dropdown in financial form
  renderTaxRates(); // Render existing tax rates
  populateInventoryItemSelects(); // Populate Inventory Items Select on Load
});
