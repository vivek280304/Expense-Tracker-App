    // Expense Tracker JavaScript with in-memory storage
        class ExpenseTracker {
            constructor() {
                this.expenses = [];
                this.currentSalary = 0;
                this.init();
            }

            init() {
                this.bindEvents();
                this.renderExpenses();
                this.updateDisplay();
                this.loadTheme();
                
                // Set today's date as default
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('date-input').value = today;
            }

            // Event Binding
            bindEvents() {
                // Theme toggle
                document.getElementById('theme-toggle').addEventListener('click', this.toggleTheme.bind(this));
                
                // Salary events
                document.getElementById('set-salary-btn').addEventListener('click', this.setSalary.bind(this));
                document.getElementById('salary-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.setSalary();
                });
                
                // Expense events
                document.getElementById('add-btn').addEventListener('click', this.addExpense.bind(this));
                
                // Allow Enter key to add expense
                const inputs = ['category-select', 'date-input', 'amount-input'];
                inputs.forEach(id => {
                    document.getElementById(id).addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') this.addExpense();
                    });
                });
            }

            // Theme Management
            toggleTheme() {
                const body = document.body;
                const themeBtn = document.getElementById('theme-toggle');
                
                if (body.classList.contains('dark-theme')) {
                    body.classList.remove('dark-theme');
                    themeBtn.innerHTML = '🌙 Dark';
                } else {
                    body.classList.add('dark-theme');
                    themeBtn.innerHTML = '☀️ Light';
                }
            }

            // Load theme
            loadTheme() {
                const themeBtn = document.getElementById('theme-toggle');
                themeBtn.innerHTML = '🌙 Dark';
            }

            // Salary Management
            setSalary() {
                const salaryInput = document.getElementById('salary-input');
                const salaryValue = parseFloat(salaryInput.value);
                
                if (isNaN(salaryValue) || salaryValue < 0) {
                    this.showAlert('Please enter a valid salary amount', 'error');
                    return;
                }
                
                this.currentSalary = salaryValue;
                document.getElementById('current-salary').textContent = this.formatCurrency(this.currentSalary);
                salaryInput.value = '';
                
                this.updateRemainingBudget();
                this.showAlert('Salary updated successfully!', 'success');
            }

            // Expense Management
            addExpense() {
                const category = document.getElementById('category-select').value;
                const date = document.getElementById('date-input').value;
                const amount = parseFloat(document.getElementById('amount-input').value);
                
                // Validation
                if (category === 'Category' || !category) {
                    this.showAlert('Please select a category', 'error');
                    return;
                }
                
                if (!date) {
                    this.showAlert('Please select a date', 'error');
                    return;
                }
                
                if (isNaN(amount) || amount <= 0) {
                    this.showAlert('Please enter a valid amount', 'error');
                    return;
                }
                
                // Create expense object
                const expense = {
                    id: Date.now() + Math.random(),
                    category: category,
                    date: date,
                    amount: amount,
                    timestamp: new Date().toISOString()
                };
                
                // Add to expenses array
                this.expenses.push(expense);
                
                // Clear form
                this.clearForm();
                
                // Update display
                this.renderExpenses();
                this.updateDisplay();
                
                this.showAlert('Expense added successfully!', 'success');
            }

            deleteExpense(id) {
                if (confirm('Are you sure you want to delete this expense?')) {
                    this.expenses = this.expenses.filter(expense => expense.id !== id);
                    this.renderExpenses();
                    this.updateDisplay();
                    this.showAlert('Expense deleted successfully!', 'success');
                }
            }

            clearForm() {
                document.getElementById('category-select').value = 'Category';
                document.getElementById('date-input').value = new Date().toISOString().split('T')[0];
                document.getElementById('amount-input').value = '';
            }

            // Display Methods
            renderExpenses() {
                const tbody = document.getElementById('expense-table-body');
                tbody.innerHTML = '';
                
                // Sort expenses by date (newest first)
                const sortedExpenses = [...this.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
                
                sortedExpenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.category}</td>
                        <td>₹${this.formatCurrency(expense.amount)}</td>
                        <td>${this.formatDate(expense.date)}</td>
                        <td>
                            <button class="delete-btn" onclick="expenseTracker.deleteExpense(${expense.id})">
                                Delete
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }

            updateDisplay() {
                const totalAmount = this.calculateTotal();
                document.getElementById('total-amount').textContent = '₹' + this.formatCurrency(totalAmount);
                this.updateRemainingBudget();
            }

            updateRemainingBudget() {
                const totalExpenses = this.calculateTotal();
                const remaining = this.currentSalary - totalExpenses;
                const remainingElement = document.getElementById('remaining-budget');
                
                remainingElement.textContent = this.formatCurrency(Math.abs(remaining));
                
                // Add visual indication for negative budget
                if (remaining < 0) {
                    remainingElement.classList.add('negative');
                    remainingElement.parentElement.innerHTML = `Overspent: ₹<span id="remaining-budget" class="negative">${this.formatCurrency(Math.abs(remaining))}</span>`;
                } else {
                    remainingElement.classList.remove('negative');
                    remainingElement.parentElement.innerHTML = `Remaining Budget: ₹<span id="remaining-budget">${this.formatCurrency(remaining)}</span>`;
                }
            }

            calculateTotal() {
                return this.expenses.reduce((total, expense) => total + expense.amount, 0);
            }

            // Utility Methods
            formatCurrency(amount) {
                return new Intl.NumberFormat('en-IN', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }).format(amount);
            }

            formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-IN', {
                    year: '2-digit',
                    month: 'short',
                    day: '2-digit'
                });
            }

            showAlert(message, type = 'info') {
                // Create alert element
                const alert = document.createElement('div');
                alert.className = `alert alert-${type}`;
                alert.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e17055' : '#74b9ff'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    font-weight: 500;
                `;
                alert.textContent = message;
                
                document.body.appendChild(alert);
                
                // Animate in
                setTimeout(() => {
                    alert.style.transform = 'translateX(0)';
                }, 100);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    alert.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (document.body.contains(alert)) {
                            document.body.removeChild(alert);
                        }
                    }, 300);
                }, 3000);
            }
        }

        // Initialize the app when DOM is loaded
        let expenseTracker;
        document.addEventListener('DOMContentLoaded', () => {
            expenseTracker = new ExpenseTracker();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!expenseTracker) return;
            
            // Ctrl/Cmd + Enter to add expense
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                expenseTracker.addExpense();
            }
            
            // Ctrl/Cmd + S to set salary
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                expenseTracker.setSalary();
            }
            
            // Ctrl/Cmd + D to toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                expenseTracker.toggleTheme();
            }
        });