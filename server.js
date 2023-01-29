const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table')

//The connection to the sql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Router1!',
        database: 'employee_db'
    },
    console.log(`Connected to the employees_db database.`)
);

//Main menu prompt whenever a function is executed it will come back here
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
    const employeeTable = `SELECT employees.id AS ID, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', roles.title AS Title, departments.name AS Department, roles.salary AS Salary, CONCAT(manager.first_name, " ", manager.last_name) AS Manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id`;
    db.query(employeeTable, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else {
            console.table(`\n`, result)
        };
        mainMenu();
    })
};

const viewAllRoles = () => {
    const rolesTable = `SELECT roles.id AS ID, roles.title AS Title, departments.name AS Department, roles.salary AS Salary 
    FROM roles
    LEFT JOIN departments ON roles.department_id = departments.id`;
    db.query(rolesTable, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else {
            console.table(`\n`, result)
        };
        mainMenu();
    })
};

const addRole = () => {
    inquirer.prompt([
        {
            type: 'Input',
            name: 'roleTitle',
            message: 'What is the title of the role you would like to add??',
            validate: (roleTitle) => {
                if (roleTitle) {
                    return true;
                } else {
                    console.log('Please enter a valid role title');
                    return false;
                }
            },
        },
        {
            type: 'number',
            name: 'roleSalary',
            message: 'What is the salary of the role?',
            validate: (roleSalary) => {
                if (roleSalary) {
                    return true;
                } else {
                    console.log('Please enter a salary');
                    return false;
                }
            },
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: 'What department does this role belong to?',
            choices: departments, 
            validate: (roleDepartment) => {
                if (roleDepartment) {
                    return true;
                } else {
                    console.log('Please enter a valid department');
                    return false;
                }
            },
        }
    ]). then((answer) => {
        db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${answer.roleTitle}', ${answer.roleSalary}, ${answer.roleDepartment})`)
        console.log(`${answer.roleTitle} has been added to roles witht the salaray of ${answer.roleSalary} in the ${answer.roleDepartment} department`);
        mainMenu();
    })
}

const viewAllDepartments = () => {
    const departmentTable = `SELECT departments.id AS ID, departments.name AS name FROM departments`;
    db.query(departmentTable, (err, result) => {
        if (err) {
            console.log('There was an error retreiving the database', err);
            return;
        } else {
            console.table(`\n`, result)
        };
        mainMenu();
    })
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'Input',
            name: 'department',
            message: 'What is the name of the department you would like to add?',
            validate: (department) => {
                if (department) {
                    return true;
                } else {
                    console.log('Please enter a valid department');
                    return false;
                }
            },
        }
    ]). then((answer) => {
        db.query(`INSERT INTO departments (name) VALUES ('${answer.department}')`)
        console.log(`${answer.department} has been added to departments`);
        mainMenu();
    })
}

mainMenu();