let expenses = [];
let totalAmount = 0;

const categorySelect = document.getElementById('category-select');
const amountInput = document.getElementById('amount-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const expensesTableBody = document.getElementById('expnese-table-body');
const totalAmountCell = document.getElementById('total-amount');

addBtn.addEventListener('click', function() {

    const category = categorySelect.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (category === '') {
        alert('Please select a category');
        return;
    }
    if (isNaN(amount) || amount <=0 ) {
        alert('Please enter a valid amoun')
        return;
    }
    if(date === '') {
        alert('Please select a date')
        return;
    }
    expenses.push({category, amount, date});

    totalAmount += amount;
    totalAmountCell.textContent = totalAmount;

    const newRow = expensesTableBody.insertRow();

    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement('button');

    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        expenses.splice(expenses.indexOf(expense), 1);

        totalAmount -= expense.amount;
        totalAmountCell.textContent = totalAmount;

        expensesTableBody.removeChild(newRow);
    });

    const expense = expenses[expenses.length - 1];
    categoryCell.textContent = expense.category;
    amountCell.textContent = expense.amount;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(deleteBtn);

});

for (const expense of expenses) {
    totalAmount += expense.amount;
    totalAmountCell.textContent = totalAmount;

    const newRow = expensesTableBody.inserRow();
    const categoryCell = newRow.insertCell();
    const amountCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const deleteCell = newRow.insertCell();
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', function() {
        expenses.splice(expenses.indexOf(expense), 1);

        totalAmount -= expense.amount;
        totalAmountCell.textContent = totalAmount;

        expensesTableBody.removeChild(newRow);
    });
    categoryCell.textContent = expense.category;
    amountCell.textContent = expense.amount;
    dateCell.textContent = expense.date;
    deleteCell.appendChild(deleteBtn);
}
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

body.classList.add('light-mode');

toggleButton.addEventListener('click', () => {
    if (body.classList.contains('light-mode') ) {
        body.classList.replace('light-mode', 'dark-mode');
        toggleButton.textContent = 'Light';
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        toggleButton.textContent = 'Dark';
    }
    saveData() 
});

// Add these functions to your existing JavaScript file

// Function to save data to localStorage
function saveData() {
    // Save expenses array
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Save total amount
    localStorage.setItem('totalAmount', totalAmount);
    
    // Save theme preference
    const currentTheme = body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode';
    localStorage.setItem('theme', currentTheme);
}

// Function to load data from localStorage
function loadData() {
    // Load expenses
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
    
    // Load total amount
    const savedTotalAmount = localStorage.getItem('totalAmount');
    if (savedTotalAmount) {
        totalAmount = Number(savedTotalAmount);
        totalAmountCell.textContent = totalAmount;
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(savedTheme);
        toggleButton.textContent = savedTheme === 'light-mode' ? 'Dark' : 'Light';
    }
    
    // Render saved expenses in the table
    renderExpenses();
}

// Function to render expenses from the expenses array
function renderExpenses() {
    // Clear existing table rows
    expensesTableBody.innerHTML = '';
    
    // Render each expense
    for (const expense of expenses) {
        const newRow = expensesTableBody.insertRow();
        
        const categoryCell = newRow.insertCell();
        const amountCell = newRow.insertCell();
        const dateCell = newRow.insertCell();
        const deleteCell = newRow.insertCell();
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', function() {
            expenses.splice(expenses.indexOf(expense), 1);
            
            totalAmount -= expense.amount;
            totalAmountCell.textContent = totalAmount;
            
            expensesTableBody.removeChild(newRow);
            
            // Save after deletion
            saveData();
        });
        
        categoryCell.textContent = expense.category;
        amountCell.textContent = expense.amount;
        dateCell.textContent = expense.date;
        deleteCell.appendChild(deleteBtn);
    }
}

// Modify your addBtn event listener to save data after adding
addBtn.addEventListener('click', function() {
    // Your existing code remains the same...
    
    // Add this line at the end:
    saveData();
});

// Call loadData when the page loads
document.addEventListener('DOMContentLoaded', loadData);

// Fix the typo in your existing code:
// Change "expensesTableBody.inserRow()" to "expensesTableBody.insertRow()"