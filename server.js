const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table')

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Router1!',
        database: 'employee_db'
    },
    console.log(`Connected to the movies_db database.`)
);

const mainMenu = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'mainMenu',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
        },])
        .then(async (answer) => {
            switch (answer.mainMenu) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Quit':
                    quit();
                    break;
            }
        })
}

const viewAllEmployees = () => {
    const employeeTable = `SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, CONCAT(manager.first_name, " ", manager.last_name) AS Manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    db.query(employeeTable, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else {
            console.table(employeeTable)
        };
        mainMenu();
    })
};

// const addEmployee = () => {
//     inquirer.prompt([
//         {
//             type: 'Input',
//             name: 'first_name',
//             message: 'What is the first name of employee?',
//             validate: (employeeFirstName) => {
//                 if (employeeFirstName) {
//                     return true;
//                 } else {
//                     console.log('Please enter the first name of the employee');
//                     return false;
//                 }
//             },
//         },
//         {
//             type: 'Input',
//             name: 'last_name',
//             message: 'What is the last name of employee?',
//             validate: (employeeLastName) => {
//                 if (employeeLastName) {
//                     return true;
//                 } else {
//                     console.log('Please enter the last name of the employee');
//                     return false;
//                 }
//             },
//         },
//     ]),
// };

const viewAllRoles = () => {
    const rolesTable = `SELECT role.id AS ID, role.title AS Title, department.name AS Department, role.salary AS Salary 
    FROM role
    LEFT JOIN department ON role.department_id = department.id`;
    db.query(rolesTable, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else {
            console.table(rolesTable)
        };
        mainMenu();
    })
};

const viewAllDepartments = () => {
    const departmentTable = `SELECT department.id AS ID, department.name AS name FROM department`;
    db.query(departmentTable, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else {
            console.table(departmentTable)
        };
        mainMenu();
    })
};


mainMenu();