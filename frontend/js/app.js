
// Expense Tracker - frontend logic


const API_URL ="http://localhost:3000/api/expenses";


// This contains the latest data received from the server
let expenses = [];

// Spinner
// --------------------------------------------------

function showSpinner() {

    document.getElementById("spinner")
        .classList.remove("d-none");

}


function hideSpinner() {

    document.getElementById("spinner")
        .classList.add("d-none");

}

// Error Alert
// --------------------------------------------------

function showError(message) {

    const alert = document.getElementById("errorAlert");

    alert.textContent = message;
    alert.classList.remove("d-none");

}
function hideError() {

    document.getElementById("errorAlert")
        .classList.add("d-none");
}

// Better Error Message
// --------------------------------------------------

function showErrorMessage(error) {

    if (error.message === "Failed to fetch") {
        showError("Unable to connect to the server. Please make sure the server is running.");
    } else {
        showError(error.message);
    }

}


// GET expenses
// --------------------------------------------------

async function getExpenses() {

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to get expenses");
        }

        const data =await response.json();
        return data;

    } catch (error) {

        console.log(error);
        showErrorMessage(error);
        return [];

    }

}



// POST expense
// --------------------------------------------------

async function addExpense(data) {

    try {

        showSpinner();


        const response =await fetch(API_URL, { method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });


        if (!response.ok) {

            const errorData =await response.json();
            throw new Error(errorData.message ||"Failed to add expense");
        }


        return await response.json();


    } catch (error) {

        console.log(error);
        showErrorMessage(error);
        return null;

    } finally {
        hideSpinner();
    }

}

// PUT expense
// --------------------------------------------------

async function updateExpense(id, data) {

    try {
        showSpinner();

        const response =await fetch(API_URL + "/" + id,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );


        if (!response.ok) {

            const errorData =await response.json();

            throw new Error(errorData.message ||"Failed to update expense");
        }
        return await response.json();

    } catch (error) {

        console.log(error);
        showErrorMessage(error);
        return null;


    } finally {

        hideSpinner();
    }

}


// DELETE expense
// --------------------------------------------------

async function deleteExpense(id) {

    try {
        showSpinner();

        const response =await fetch(API_URL + "/" + id,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            const errorData =await response.json();
            throw new Error(errorData.message ||"Failed to delete expense");
        }

        return await response.json();


    } catch (error) {

        console.log(error);
        showErrorMessage(error);
        return null;

    } finally {
        hideSpinner();
    }

}



// Refresh
// --------------------------------------------------

async function refresh() {

    hideError();
    showSpinner();
    expenses =await getExpenses();
    renderTable(expenses);
    renderSummary(expenses);
    renderChart();
    hideSpinner();

}



// Render Table
// --------------------------------------------------

function renderTable(list) {

    const tbody =document.getElementById(
            "expensesTableBody"
        );


    // Remove old rows

    tbody.innerHTML = "";


    // Create a row for every expense

    list.forEach(expense => {


        const row =document.createElement("tr");
        // Title

        const titleCell =document.createElement("td");

        titleCell.textContent =expense.title;

        // Amount

        const amountCell =document.createElement("td");

        amountCell.textContent =Number(expense.amount).toFixed(2);
        // Category
        const categoryCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.classList.add("badge");

        if (expense.category === "Food") {
            badge.classList.add("bg-success");
        } else if (expense.category === "Transport") {
            badge.classList.add("bg-primary");
        } else if (expense.category === "Bills") {
            badge.classList.add("bg-warning", "text-dark");
        } else if (expense.category === "Entertainment") {
            badge.classList.add("bg-danger");
        } else {
            badge.classList.add("bg-secondary");
        }

        badge.textContent = expense.category;
        categoryCell.appendChild(badge);


        // Date

        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            expense.date;


        // Edit cell

        const editCell =
            document.createElement("td");


        const editButton =
            document.createElement("button");


        editButton.textContent =
            "Edit";


        editButton.className =
            "btn btn-warning btn-sm";


        editButton.addEventListener(
            "click",
            () => startEdit(expense)
        );


        editCell.appendChild(
            editButton
        );


        // Delete cell

        const deleteCell =document.createElement("td");
        const deleteButton =document.createElement("button");

        deleteButton.textContent ="Delete";
        deleteButton.className = "btn btn-danger btn-sm";


        deleteButton.addEventListener(
            "click",
            () => handleDelete(expense.id)
        );


        deleteCell.appendChild(
            deleteButton
        );


        // Add cells to row

        row.appendChild(titleCell);

        row.appendChild(amountCell);

        row.appendChild(categoryCell);

        row.appendChild(dateCell);

        row.appendChild(editCell);

        row.appendChild(deleteCell);


        // Add row to table

        tbody.appendChild(row);

    });

}



// Render Summary
// --------------------------------------------------

function renderSummary(list) {
    // Total amount
    const total =list.reduce((sum, expense) => {
                return sum +Number(expense.amount);},
            0
        );

    // Number of expenses
    const count =list.length;

    // Highest expense

    let highest = 0;


    if (list.length > 0) {

        highest =Math.max(...list.map(expense => Number(expense.amount)));

    }


    // Update HTML

    document.getElementById("totalAmount").textContent =total.toFixed(2);

    document.getElementById("expenseCount").textContent =count;

    document.getElementById("highestExpense").textContent =highest.toFixed(2);

}


// Expense Chart
// --------------------------------------------------

let expenseChart;

function renderChart() {

    const categories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    const totals = categories.map(category => {

        return expenses.filter(expense => expense.category === category).reduce(
                (sum, expense) =>sum + Number(expense.amount),0);

    });
    // ctx = context  هوه اختصار كلمه 
    const ctx =document.getElementById("expenseChart");

    if (expenseChart) {expenseChart.destroy();}
    expenseChart = new Chart(ctx, {
        type: "bar",
        data: { labels: categories,
            datasets: [{
                label: "Amount (JD)",
                data: totals,

                backgroundColor: [
                    "#198754",
                    "#0d6efd",
                    "#ffc107",
                    "#dc3545",
                    "#6c757d"
                ]
            }]

        },options: {
            responsive: true,
            scales: {y: {beginAtZero: true}}
        }
    });
}

// Filter
// --------------------------------------------------

function applyFilter() {

    const category =document.getElementById("categoryFilter").value;
    const searchText =document.getElementById("titleSearch").value.toLowerCase();
    const filteredExpenses =expenses.filter(expense => {
    const matchesCategory =category === "All" ||expense.category === category;
    const matchesSearch =expense.title.toLowerCase().includes(searchText);
                return (
                    matchesCategory && matchesSearch);
            }
        );

    renderTable(filteredExpenses);
}



// Start Edit
// --------------------------------------------------

function startEdit(expense) {

    document.getElementById("editExpenseId").value =
        expense.id;

    document.getElementById("editTitle").value =
        expense.title;

    document.getElementById("editAmount").value =
        expense.amount;

    document.getElementById("editCategory").value =
        expense.category;

    document.getElementById("editDate").value =
        expense.date;

    const modal =new bootstrap.Modal(document.getElementById("editExpenseModal"));
    modal.show();

}


// Start Edit
// --------------------------------------------------

function startEdit(expense) {

    // Put current expense data into the modal

    document.getElementById("editExpenseId").value = expense.id;
    document.getElementById("editTitle").value = expense.title;
    document.getElementById("editAmount").value = expense.amount;
    document.getElementById("editCategory").value = expense.category;
    document.getElementById("editDate").value = expense.date;


    // Open Bootstrap Modal

    const modal = new bootstrap.Modal(document.getElementById("editExpenseModal"));
    modal.show();

}


// Edit Expense Form Submit - PUT
// --------------------------------------------------

document.getElementById("editExpenseForm").addEventListener("submit",async function (event)
 {
        event.preventDefault();
        const id =document.getElementById("editExpenseId").value;


        const data = {title:document.getElementById("editTitle").value.trim(),

            amount:
                Number(document.getElementById("editAmount").value),

            category:
                document.getElementById("editCategory").value,

            date:
                document.getElementById("editDate").value
        };


        const result =await updateExpense(id,data);
        if (result) {

            const modalElement =document.getElementById("editExpenseModal");
            const modal =bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            await refresh();

        }

    }
);


// Form Submit - Add Expense
// --------------------------------------------------

document.getElementById("expenseForm").addEventListener("submit",
    async function (event) {
        event.preventDefault();
        const data = {
            title:
                document.getElementById("title").value.trim(),

            amount:
                Number(document.getElementById("amount").value),

            category:
                document.getElementById("category").value,

            date:
                document.getElementById("date").value

        };


        // Add only

        const result =await addExpense(data);
        if (result) {

            document.getElementById("expenseForm").reset();
            await refresh();

        }

    }
);



// Delete
// --------------------------------------------------

async function handleDelete(id) {

    const confirmed =confirm("Are you sure you want to delete this expense?");


    if (!confirmed) {
        return;
    }
    const result =await deleteExpense(id);
    if (result) {
        await refresh();
    }

}


// Filter event
// --------------------------------------------------

document.getElementById("categoryFilter").addEventListener("change",applyFilter);

// Search event
// --------------------------------------------------

document.getElementById(
    "titleSearch"
).addEventListener(
    "input",
    applyFilter
);

// Dark Mode
// --------------------------------------------------

document.getElementById("darkModeButton").addEventListener("click",function () {
        document.body.classList.toggle("dark-mode");

        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {
            this.textContent =
                "☀️ Light Mode";

        } else {
            this.textContent =
                "🌙 Dark Mode";

        }
    }
);

// Start application
// --------------------------------------------------

refresh();

