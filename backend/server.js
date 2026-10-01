// Expense Tracker - Backend
// Express + PostgreSQL

// express:is a Node.js framework that helps us create the server and API routes.
//CORS allows the frontend and backend to communicate with each other.
//Pool is used to manage database connections between Node.js and PostgreSQL.
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();


// Create Express application
const app = express();
// Port
const PORT = process.env.PORT || 3000;
// CORS
app.use(cors());
// Allow JSON requests
app.use(express.json());


// PostgreSQL connection
const pool = new Pool({

    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT

});



// GET /api/hello
/*req = request
  res = response*/
app.get("/api/hello", (req, res) => {

    res.json({
        message: "Hello from Expense Tracker API"
    });

});



// GET /api/expenses
// Get all expenses

app.get("/api/expenses", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            ORDER BY date DESC, id DESC
        `);

        //amoint:: float8 
        //PostgreSQL ممكن يرجع NUMERIC بطريقة مش مناسبة تمامًا للـ JavaScript.
       

        //res.status (200)=> Success
        //res.status (201)=> Created
        //res.status (400)=> Bad request
        //res.status (404)=> Not found
        //res.status (500)=> Server Error


        res.status(200).json(result.rows);
    } catch (error) {

        res.status(500).json({
            message: "Failed to get expenses"
        });

    }

});

// GET /api/expenses/:id
// Get one expense

//id: يسمى Route Parameter
app.get("/api/expenses/:id", async (req, res) => {

    const id = Number(req.params.id);


    // Check ID
    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });
    }


    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
        `, [id]);
        //Parameterized Queries ^

        // Expense not found
        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Expense not found"
            });

        }


        res.status(200).json(result.rows[0]);


    } catch (error) {

    
        res.status(500).json({
            message: "Failed to get expense"
        });

    }

});



// POST /api/expenses
// Add expense
// --------------------------------------------------

app.post("/api/expenses", async (req, res) => {

    const {
        title,
        amount,
        category,
        date
    } = req.body;


    // Check required data
    if (typeof title !== "string" || title.trim() === "") {

        return res.status(400).json({
            message: "Title is required"})
    }


    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {

        return res.status(400).json({
            message: "Amount is required"
        });

    }

    // نتأكد إنه رقم صحيح وموجب 
    const numericAmount = Number(amount);
    if ( !Number.isFinite(numericAmount) ||numericAmount <= 0) {
        return res.status(400).json({
            message: "Amount must be greater than 0"
        });

    }

    const validCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];

    if (!validCategories.includes(category)) {
        return res.status(400).json({message: "Invalid category"});
    }


    if (!date) {
        return res.status(400).json({ message: "Date is required"});
    }


    try {
        const result = await pool.query(`
            INSERT INTO expenses
                (title, amount, category, date)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [
            title.trim(),
            numericAmount,
            category,
            date
        ]);


        res.status(201).json(result.rows[0]);


    } catch (error) {

        res.status(400).json({
            message: "Invalid expense data"
        });

    }

});



// PUT /api/expenses/:id
// Update expense
// --------------------------------------------------

app.put("/api/expenses/:id", async (req, res) => {

    const id = Number(req.params.id);

    // Check ID
    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });

    }


    const {
        title,
        amount,
        category,
        date
    } = req.body;


    // Validate title
    if (
        typeof title !== "string" ||
        title.trim() === ""
    ) {

        return res.status(400).json({
            message: "Title is required"
        });

    }


    // Validate amount
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {

        return res.status(400).json({
            message: "Amount is required"
        });

    }


    const numericAmount = Number(amount);


    if (
        !Number.isFinite(numericAmount) ||numericAmount <= 0
    ) {

        return res.status(400).json({
            message: "Amount must be greater than 0"
        });

    }


    // Validate category
    const validCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Other"
    ];


    if (!validCategories.includes(category)) {

        return res.status(400).json({
            message: "Invalid category"
        });

    }


    // Validate date
    if (!date) {

        return res.status(400).json({
            message: "Date is required"
        });

    }


    try {

        const result = await pool.query(`
            UPDATE expenses
            SET
                title = $1,
                amount = $2,
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [
            title.trim(),
            numericAmount,
            category,
            date,
            id
        ]);


        // Expense not found
        if (result.rows.length === 0) 
            {
            return res.status(404).json({
                message: "Expense not found"
            });

        }


        res.status(200).json(result.rows[0]);


    } catch (error) {

        res.status(400).json({
            message: "Invalid expense data"
        });

    }

});



// DELETE /api/expenses/:id
// Delete expense
// --------------------------------------------------

app.delete("/api/expenses/:id", async (req, res) => {

    const id = Number(req.params.id);


    // Check ID
    if (!Number.isInteger(id)) {

        return res.status(400).json({
            message: "Invalid expense ID"
        });

    }


    try {

        const result = await pool.query(`
            DELETE FROM expenses
            WHERE id = $1
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [id]);


        // Expense not found
        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Expense not found"
            });

        }


        res.status(200).json({
            message: "Expense deleted successfully",
            expense: result.rows[0]
        });


    } catch (error) {

        res.status(500).json({
            message: "Failed to delete expense"
        });

    }

});



// 404 - Route not found
// --------------------------------------------------
 // مش موجود route إذا المستخدم دخل على  
app.use((req, res) => {

    res.status(404).json({
        message: "Route not found"
    });

});



// Start server
// --------------------------------------------------
//app.listen() starts the Express server and listens for incoming requests on port 3000.
app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );

});


