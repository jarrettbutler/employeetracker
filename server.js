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

//Creating an array with all the choices in it for roles and departments 
//These roles and departments will become a strong that is used as the choices
//In the add functions
db.query(`SELECT id, name FROM departments`, function (err, departments){
    if (err) {
    console.log(err);
    }
    const departmentName = departments.map(department => departments.name);
})

const departments = db.query(`SELECT * FROM departments`)
.map(({ id, name }) => ({
    name: name,
    value: id
}));

db.query(`SELECT id, title FROM roles`, function (err, roles){
    if (err) {
    console.log(err);
    }
    const jobs = roles.map(role => role.title);
})

db.query(`SELECT id, title FROM roles`, function (err, roles){
    if (err) {
    console.log(err);
    }
    const jobs = roles.map(role => role.title);
})

db.query(`SELECT id, title FROM roles`, function (err, roles){
    if (err) {
    console.log(err);
    }
    const jobs = roles.map(role => role.title);
})

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
                    console.log(`Have a nice day to confirm you'd like to quit the program please press ctrl + c`);
                    break;
            }
        })
}

//Allows us to view all employees and information if there is an error and error message will appear if sucessful a table will display
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

//Function add employee based on user choice if err an error message will appear if not the message will appear and the employee will be added to the DB
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'Input',
            name: 'employeeFirstName',
            message: 'What is the first name of the employee?',
            validate: (firstName) => {
                if (firstName) {
                    return true;
                } else {
                    console.log('Please enter a valid first name');
                    return false;
                }
            },
        },
        {
            type: 'number',
            name: 'employeeLastName',
            message: 'What is the last name of the employee?',
            validate: (lastName) => {
                if (lastName) {
                    return true;
                } else {
                    console.log('Please enter a valid last name');
                    return false;
                }
            },
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: 'What is the employees role?',
            choices: jobs,
        },
        {
            type: 'list',
            name: 'employeeManager',
            message: 'What is the employees manager?',
            choices: managers,
        }
    ]).then((answer) => {
        db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', ${answer.employeeRole}, ${answer.employeeManager})`, (err, result) => {
            if (err) {
                console.log('There was an error adding this employee to the database', err);
                return;
            } else {
                console.log(`${answer.employeeFirstName} ${answer.employeeLastName} has been added to employees as the ${answer.employeeRole} under ${answer.employeeManager}`);
            };
        });
        mainMenu();
    });
};

//Function that updates a employee job based on user input if theres an error it will show a message on success a message will appear and the DB will be updated
const updateEmployeeRole = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'updateEmployee',
            message: 'What employee would you like to update?',
            choices: employees
        },
        {
            type: 'list',
            name: 'updateRole',
            message: 'What new role would you like to assign this employee?',
            choices: roles
        },
    ]).then((answer) => {
        db.query(`UPDATE employees SET role_id = ${answer.updateRole} WHERE id = ${answer.updateEmployee}`, (err, result) => {
            if (err) {
                console.log('There was an error updating this employee in the database', err);
            } else {
                console.log(`${answer.updateEmployee} has been updated to `)
            }
        });
        mainMenu();
    });
};

//Allows us to view all roles and information if there is an error and error message will appear if sucessful a table will display
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

//Function add roles based on user choice if err an error message will appear if not the message will appear and the role will be added to the DB
const addRole = () => {
    inquirer.prompt([
        {
            type: 'Input',
            name: 'roleTitle',
            message: 'What is the title of the role you would like to add?',
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
            choices: departmentName,
        }
    ]).then((answer) => {
        const selectedDepartment = departments.find(department => departments.name === answer.roleDepartment);
        db.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${answer.roleTitle}', ${answer.roleSalary}, ${answer.roleDepartment})`, (err, result) => {
            if (err) {
                console.log('There was an error adding this role to the database', err);
                return;
            } else {
                console.log(`${answer.roleTitle} has been added to roles with the salaray of ${answer.roleSalary} in the ${answer.roleDepartment} department`);
            };
        });
        mainMenu();
    });
};


//Allows us to view all departments if there is an error and error message will appear if sucessful a table will display
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

//Function add departments based on user choice if err an error message will appear if not the message will appear and the department will be added to the DB
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
    ]).then((answer) => {
        db.query(`INSERT INTO departments (name) VALUES ('${answer.department}')`, (err, result) => {
            if (err) {
                console.log('There was an error adding this department to the database', err);
                return;
            } else {
                console.log(`${answer.department} has been added to departments`);
            };
        });
        mainMenu();
    })
};

//Starts the first main menu prompt
mainMenu();