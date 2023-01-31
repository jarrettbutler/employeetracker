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

//Creates an array of jobs from the database and the function to ensure it gets updated everytime it's used
const jobs = [];
makeRoles = () => {
db.query('SELECT roles.title FROM roles', function (err, result) {
    if (err) {
        console.log(err)
    } else {
        result.map(item => jobs.push(item.title))
    }
});
};

//Creates an array of jobs from the database and the function to ensure it gets updated everytime it's used
const managers = [];
makeManagers = () => {
db.query('SELECT * FROM employees WHERE manager_id IS NULL', function (err, result) {
    if (err) {
        console.log(err)
    } else {
        result.map(item => managers.push(item.first_name + ' ' + item.last_name))
    }
});
};

//Creates an array of the employees and the function to ensure it gets updated everytime it's used
const employees = [];
makeEmployees = () => {
db.query('SELECT employees.first_name, employees.last_name FROM employees', function (err, result) {
    if (err) {
        console.log(err)
    } else {
        result.map(item => employees.push(item.first_name + ' ' + item.last_name))
    }
});
};

//Creates an array of departments from the departments table and the function to ensure it gets updated everytime it's used
const depts =[]
makeDepartments = () => {
db.query('SELECT departments.id, departments.namee FROM departments', function (err, result) {
    if (err) {
        console.log(err)
    } else {
        result.map(item => depts.push(item.namee))
    }
});
};

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
    const employeeTable = `SELECT employees.id AS ID, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', roles.title AS Title, departments.namee AS Department, roles.salary AS Salary, CONCAT(manager.first_name, " ", manager.last_name) AS Manager
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
    makeRoles();
    makeManagers();
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
            type: 'Input',
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
        //Splits the managers name
        const splitManager = answer.employeeManager.split(" ");
        //Gets the id of the role
        db.query(`SELECT roles.id FROM roles WHERE roles.title = '${answer.employeeRole}'`, (err, results) => {
            if (err) throw err;
            //Gets the id of the manager
            db.query(`SELECT employees.id FROM employees WHERE first_name = '${splitManager[0]}' AND last_name = '${splitManager[1]}'`, (err, result) => {
                if (err) throw err;
                db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${answer.employeeFirstName}', '${answer.employeeLastName}', ${results[0].id}, ${result[0].id})`, (err, result) => {
                    if (err) {
                        console.log('There was an error adding this employee to the database', err);
                        return;
                    } else {
                        console.log(`${answer.employeeFirstName} ${answer.employeeLastName} has been added to employees as the ${answer.employeeRole} under ${answer.employeeManager}`);
                    };
                });
                mainMenu();
            });
        });
    });
};

//Function that updates a employee job based on user input if theres an error it will show a message on success a message will appear and the DB will be updated
const updateEmployeeRole = () => {
    makeEmployees();
    makeRoles();
    inquirer.prompt([
        {
            type: 'list',
            name: 'updateEmployee',
            message: 'What employee would you like to update?',
            choices: employees,
        },
        {
            type: 'list',
            name: 'updateRole',
            message: 'What new role would you like to assign this employee?',
            choices: jobs,
        },
    ]).then((answer) => {
        //Splits the employees name
        const splitEmployee = answer.updateEmployee.split(" ");
        //Gets the id of the selected role
        db.query(`SELECT roles.id FROM roles WHERE roles.title = '${answer.updateRole}'`, (err, results) => {
            if (err) throw err;
            //Get the id of the employee
            db.query(`SELECT employees.id FROM employees WHERE first_name = '${splitEmployee[0]}' AND last_name = '${splitEmployee[1]}'`, (err, result) => {
                if (err) throw err;
                //Update function for SQL
                db.query(`UPDATE employees SET role_id = ${results[0].id} WHERE id = ${result[0].id}`, (err, result) => {
                    if (err) {
                        console.log('There was an error updating this employee in the database', err);
                    } else {
                        console.log(`${answer.updateEmployee} has been updated to `)
                    }
                });
                mainMenu();
            });
        });
    });
};

//Allows us to view all roles and information if there is an error and error message will appear if sucessful a table will display
const viewAllRoles = () => {
    const rolesTable = `SELECT roles.id AS ID, roles.title AS Title, departments.namee AS Department, roles.salary AS Salary 
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
    makeDepartments();
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
            choices: depts,
        }
    ]).then((answer) => {
        db.query(`SELECT departments.id FROM departments WHERE departments.namee = '${answer.roleDepartment}'`, (err, results) => {
            if (err) throw err;
            db.query(`INSERT INTO roles (title, salary, department_id) VALUES ('${answer.roleTitle}', ${answer.roleSalary}, ${results[0].id})`, (err, results) => {
                if (err) {
                    console.log('There was an error adding this role to the database', err);
                    return;
                } else {
                    console.log(`${answer.roleTitle} has been added to roles with the salaray of ${answer.roleSalary} in the ${answer.roleDepartment} department`);
                };
            });
            mainMenu();
        });
    });
};


//Allows us to view all departments if there is an error and error message will appear if sucessful a table will display
const viewAllDepartments = () => {
    const departmentTable = `SELECT departments.id AS ID, departments.namee AS name FROM departments`;
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
        db.query(`INSERT INTO departments (namee) VALUES ('${answer.department}')`, (err, result) => {
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