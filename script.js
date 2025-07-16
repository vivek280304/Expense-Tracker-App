 // Expense Tracker JavaScript (Enhanced with Date Navigation)
 class ExpenseTracker {
    constructor() {
        this.expenses = [];
        this.currentSalary = 0;
        this.customCategories = [];
        this.isDarkTheme = false;
        this.currentFilter = 'all'; // 'all', 'today', 'week', 'month', 'date'
        this.selectedDate = null; // Stores specific date string for 'date' filter
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.renderExpenses();
        this.updateDisplay();
        this.renderDateNavigation();
        this.loadTheme();
        this.loadCustomCategories();
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date-input').value = today;
    }

    // --- Local Storage Management ---
    saveData() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        localStorage.setItem('currentSalary', this.currentSalary);
        localStorage.setItem('customCategories', JSON.stringify(this.customCategories));
        localStorage.setItem('isDarkTheme', this.isDarkTheme);
    }

    loadData() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.currentSalary = parseFloat(localStorage.getItem('currentSalary')) || 0;
        this.customCategories = JSON.parse(localStorage.getItem('customCategories')) || [];
        this.isDarkTheme = JSON.parse(localStorage.getItem('isDarkTheme') || 'false');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear ALL expense data, budget, and settings? This cannot be undone.')) {
            localStorage.clear();
            this.expenses = [];
            this.currentSalary = 0;
            this.customCategories = [];
            this.isDarkTheme = false;
            this.currentFilter = 'all';
            this.selectedDate = null;
            this.init(); // Re-initialize to reset UI and load defaults
            this.showAlert('All data cleared successfully!', 'success');
        }
    }

    // --- Event Binding ---
    bindEvents() {
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('clear-data-btn').addEventListener('click', () => this.clearAllData());
        document.getElementById('set-salary-btn').addEventListener('click', () => this.setSalary());
        document.getElementById('salary-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setSalary();
        });
        document.getElementById('category-select').addEventListener('change', () => this.handleCategoryChange());
        document.getElementById('custom-category-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCustomCategory();
        });
        document.getElementById('add-btn').addEventListener('click', () => this.addExpense());
        
        // Event listeners for desktop date filters
        document.querySelectorAll('.date-filters-desktop .date-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDateFilter(e.target.dataset.filter, 'desktop'));
        });

        // Event listeners for mobile bottom nav date filters
        document.querySelectorAll('.bottom-nav-bar .date-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDateFilter(e.target.dataset.filter, 'mobile'));
        });
        
        const inputs = ['date-input', 'amount-input'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addExpense();
            });
        });
    }

    // --- Theme Management ---
    toggleTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        
        this.isDarkTheme = !this.isDarkTheme;
        body.classList.toggle('dark-theme', this.isDarkTheme);
        themeBtn.innerHTML = this.isDarkTheme ? 'Light' : 'Dark';
        
        this.saveData();
    }

    loadTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        
        body.classList.toggle('dark-theme', this.isDarkTheme);
        themeBtn.innerHTML = this.isDarkTheme ? 'Light' : 'Dark';
    }

    // --- Category Management ---
    loadCustomCategories() {
        const categorySelect = document.getElementById('category-select');
        const customOption = categorySelect.querySelector('option[value="Custom"]');
        
        // Clear existing custom categories to prevent duplicates on load
        Array.from(categorySelect.options).forEach(option => {
            if (!['Food & Beverage', 'Rent', 'Transport', 'Utility', 'Borrow', 'Other', 'Custom', ''].includes(option.value)) {
                option.remove();
            }
        });

        this.customCategories.forEach(categoryName => {
            const newOption = document.createElement('option');
            newOption.value = categoryName;
            newOption.textContent = categoryName;
            categorySelect.insertBefore(newOption, customOption);
        });
    }

    handleCategoryChange() {
        const categorySelect = document.getElementById('category-select');
        const customCategoryInput = document.getElementById('custom-category-input');
        
        if (categorySelect.value === 'Custom') {
            customCategoryInput.style.display = 'block';
            customCategoryInput.focus();
        } else {
            customCategoryInput.style.display = 'none';
            customCategoryInput.value = '';
        }
    }

    addCustomCategory() {
        const customCategoryInput = document.getElementById('custom-category-input');
        const categorySelect = document.getElementById('category-select');
        const newCategory = customCategoryInput.value.trim();

        if (newCategory) {
            if (this.customCategories.includes(newCategory) || 
                Array.from(categorySelect.options).some(opt => opt.value === newCategory)) {
                this.showAlert('Category already exists!', 'error');
                return;
            }

            this.customCategories.push(newCategory);
            this.saveData();
            this.loadCustomCategories(); // Reload to add the new category to the dropdown

            categorySelect.value = newCategory; // Select the newly added category
            customCategoryInput.value = '';
            customCategoryInput.style.display = 'none';
            this.showAlert(`Custom category "${newCategory}" added!`, 'success');
        } else {
            this.showAlert('Custom category cannot be empty.', 'error');
        }
    }

    // --- Salary/Budget Management ---
    setSalary() {
        const salaryInput = document.getElementById('salary-input');
        const newSalary = parseFloat(salaryInput.value);

        if (isNaN(newSalary) || newSalary < 0) {
            this.showAlert('Please enter a valid positive number for your budget.', 'error');
            return;
        }

        this.currentSalary = newSalary;
        this.saveData();
        this.updateDisplay();
        salaryInput.value = ''; // Clear input after setting
        this.showAlert('Monthly budget set successfully!', 'success');
    }

    // --- Expense Management ---
    addExpense() {
        const categorySelect = document.getElementById('category-select');
        const customCategoryInput = document.getElementById('custom-category-input');
        const dateInput = document.getElementById('date-input');
        const amountInput = document.getElementById('amount-input');

        let category = categorySelect.value;
        if (category === 'Custom') {
            category = customCategoryInput.value.trim();
            if (!category) {
                this.showAlert('Please enter a custom category name.', 'error');
                return;
            }
            if (!this.customCategories.includes(category)) {
                this.customCategories.push(category);
                this.saveData(); // Save new custom category immediately
                this.loadCustomCategories(); // Refresh dropdown
                categorySelect.value = category; // Select the newly added category
            }
        }

        const date = dateInput.value;
        const amount = parseFloat(amountInput.value);

        if (!category || !date || isNaN(amount) || amount <= 0) {
            this.showAlert('Please fill in all fields with valid data.', 'error');
            return;
        }

        const newExpense = {
            id: Date.now(), // Unique ID for each expense
            category: category,
            amount: amount,
            date: date
        };

        this.expenses.push(newExpense);
        this.saveData();
        this.renderExpenses();
        this.updateDisplay();
        this.renderDateNavigation(); // Re-render date chips after adding an expense

        // Clear inputs
        categorySelect.value = ''; 
        dateInput.value = new Date().toISOString().split('T')[0]; // Reset to today
        amountInput.value = '';
        customCategoryInput.value = '';
        customCategoryInput.style.display = 'none';

        this.showAlert('Expense added successfully!', 'success');
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveData();
        this.renderExpenses();
        this.updateDisplay();
        this.renderDateNavigation(); // Re-render date chips after deleting an expense
        this.showAlert('Expense deleted!', 'info');
    }

    // --- Display and Rendering ---
    renderExpenses() {
        const tableBody = document.getElementById('expense-table-body');
        tableBody.innerHTML = ''; // Clear existing rows

        const filteredExpenses = this.getFilteredExpenses();

        if (filteredExpenses.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No expenses added yet for this filter.</td></tr>';
            return;
        }

        filteredExpenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>₹${this.formatCurrency(expense.amount)}</td>
                <td>${this.formatDate(expense.date)}</td>
                <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for delete buttons
        tableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteExpense(id);
            });
        });
    }

    updateDisplay() {
        const currentSalarySpan = document.getElementById('current-salary');
        const remainingBudgetSpan = document.getElementById('remaining-budget');
        const totalAmountSpan = document.getElementById('total-amount');

        const totalExpenses = this.getFilteredExpenses().reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBudget = this.currentSalary - totalExpenses;

        currentSalarySpan.textContent = this.formatCurrency(this.currentSalary);
        totalAmountSpan.textContent = `₹${this.formatCurrency(totalExpenses)}`;
        
        remainingBudgetSpan.textContent = this.formatCurrency(remainingBudget);
        remainingBudgetSpan.classList.toggle('negative', remainingBudget < 0);

        this.updateFilterInfo();
    }

    // --- Date Navigation Methods ---
    handleDateFilter(filter, source) {
        this.currentFilter = filter;
        this.selectedDate = null; // Clear specific date selection

        // Update active button classes in both desktop and mobile bars
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Find and activate the correct button in the clicked source
        if (source === 'desktop') {
            document.querySelector(`.date-filters-desktop [data-filter="${filter}"]`).classList.add('active');
        } else if (source === 'mobile') {
             document.querySelector(`.bottom-nav-bar [data-filter="${filter}"]`).classList.add('active');
        }


        // Update date chips (deselect all)
        this.renderDateNavigation();

        // Re-render expenses
        this.renderExpenses();
        this.updateDisplay();
        this.showAlert(`Showing expenses for: ${filter === 'all' ? 'All Dates' : filter.charAt(0).toUpperCase() + filter.slice(1)}`, 'info');
    }

    handleDateSelection(dateStr) {
        this.selectedDate = dateStr;
        this.currentFilter = 'date'; // Set filter to specific date

        // Deactivate all general filter buttons in both desktop and mobile
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Update date chips (select the clicked one)
        this.renderDateNavigation();

        // Re-render expenses
        this.renderExpenses();
        this.updateDisplay();
        this.showAlert(`Showing expenses for: ${this.formatDate(dateStr)}`, 'info');
    }

    getFilteredExpenses() {
        let filtered = [...this.expenses]; // Start with all expenses

        // Sort expenses by date (newest first) for consistent display
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (this.selectedDate) {
            filtered = filtered.filter(expense => expense.date === this.selectedDate);
        } else {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            
            switch (this.currentFilter) {
                case 'today':
                    filtered = filtered.filter(expense => expense.date === todayStr);
                    break;
                case 'week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay()); // Sunday of the current week
                    weekStart.setHours(0, 0, 0, 0); // Start of day
                    filtered = filtered.filter(expense => new Date(expense.date) >= weekStart);
                    break;
                case 'month':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    filtered = filtered.filter(expense => new Date(expense.date) >= monthStart);
                    break;
                default:
                    // 'all' - no further filtering needed
                    break;
            }
        }
        return filtered;
    }

    renderDateNavigation() {
        const dateList = document.getElementById('date-list');
        // Get unique dates from ALL expenses, regardless of current filter
        const uniqueDates = [...new Set(this.expenses.map(expense => expense.date))].sort((a, b) => new Date(b) - new Date(a));
        
        if (uniqueDates.length === 0) {
            dateList.innerHTML = '<div style="text-align: center; color: #666; width: 100%;">No expense dates available</div>';
            return;
        }
        
        dateList.innerHTML = '';
        
        uniqueDates.forEach(dateStr => {
            const expensesForDate = this.expenses.filter(expense => expense.date === dateStr);
            const totalForDate = expensesForDate.reduce((sum, expense) => sum + expense.amount, 0);
            
            const dateChip = document.createElement('div');
            dateChip.className = `date-chip ${this.selectedDate === dateStr ? 'selected' : ''}`;
            dateChip.innerHTML = `
                <span>${this.formatDate(dateStr)}</span>
                <span class="expense-count">${expensesForDate.length}</span>
            `;
            dateChip.title = `${expensesForDate.length} expenses, Total: ₹${this.formatCurrency(totalForDate)}`;
            dateChip.addEventListener('click', () => this.handleDateSelection(dateStr));
            
            dateList.appendChild(dateChip);
        });
    }

    updateFilterInfo() {
        const filterInfo = document.getElementById('filter-info');
        const filterText = document.getElementById('filter-text');
        const filteredExpenses = this.getFilteredExpenses();
        
        if (this.currentFilter === 'all' && !this.selectedDate) {
            filterInfo.style.display = 'none';
            return;
        }
        
        filterInfo.style.display = 'block';
        
        if (this.selectedDate) {
            filterText.textContent = `Showing expenses for ${this.formatDate(this.selectedDate)} (${filteredExpenses.length} expenses)`;
        } else {
            const filterNames = {
                'today': 'Today',
                'week': 'This Week',
                'month': 'This Month'
            };
            filterText.textContent = `Showing expenses for ${filterNames[this.currentFilter]} (${filteredExpenses.length} expenses)`;
        }
    }

    // --- Utility Functions ---
    formatCurrency(amount) {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    showAlert(message, type) {
        const alertBox = document.createElement('div');
        alertBox.className = `alert ${type}`;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        // Show alert
        setTimeout(() => {
            alertBox.classList.add('show');
        }, 10); // Small delay for transition

        // Hide and remove alert after a few seconds
        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.addEventListener('transitionend', () => alertBox.remove());
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ExpenseTracker();
});