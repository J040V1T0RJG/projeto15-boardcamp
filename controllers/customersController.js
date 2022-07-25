import connection from "../dbStrategy/postgres.js";
import customersSchema from "../schemas/customersSchema.js";

const getCustomers = async (req, res) => {
    const cpf = req.query.cpf;

    try {
        if (cpf) {
            const { rows: findCPFThatStarts } = await connection.query(`SELECT * FROM customers WHERE cpf LIKE '${cpf}%'`);
            res.status(200).send(findCPFThatStarts);
            return;
        };

        const { rows: customersTableArray } = await connection.query(`SELECT * FROM customers`);
        res.status(200).send(customersTableArray);
        
    } catch (error) {
        res.status(500).send(error);
    };
};

const getCustomersId = async (req, res) => {
    const cpf = req.params.id;

    try {
        const { rows: customersTableArray } = await connection.query(`SELECT * FROM customers WHERE cpf = '${cpf}'`);

        if (!customersTableArray[0]) {
            res.sendStatus(404);
            return;
        };
    
        res.send(customersTableArray);
    } catch (error) {
        res.status(500).send(error);
    };
};

const postCustomers = async (req, res) => {
    const customer = req.body;
    const { error: errorCustomerSchema } = customersSchema.validate(customer, { abortEarly: false});

    if (errorCustomerSchema) {
        res.sendStatus(400);
        return;
    };

    try {
        const {rows: evaluatesIfCPfExists} = await connection.query(`SELECT * FROM customers WHERE cpf = '${customer.cpf}'`);
        if (evaluatesIfCPfExists[0]) {
            res.sendStatus(409);
            return;
        };

        const insertCustomerInTableCustomers = await connection.query(`
            INSERT INTO customers 
            (name, phone, cpf, birthday)
            VALUES ('${customer.name}', '${customer.phone}', '${customer.cpf}', '${customer.birthday}')
        `);
        res.sendStatus(201);
        
    } catch (error) {
        res.status(500).send(error);
    };
};

const putCustomers = async (req, res) => {
    const customerUpdate = req.body;
    const id = req.params.id;
    const { error: errorCustomerSchema } = customersSchema.validate(customerUpdate, { abortEarly: false});

    if (errorCustomerSchema) {
        res.sendStatus(400);
        return;
    };

    try {
        const {rows: evaluatesIfCPfExists} = await connection.query(`SELECT * FROM customers WHERE cpf = '${customerUpdate.cpf}'`);
        if (evaluatesIfCPfExists[0]) {
            res.sendStatus(409);
            return;
        };

        const updateCustomerInTableCustomers = await connection.query(`
            UPDATE customers 
            SET name = '${customerUpdate.name}', phone = '${customerUpdate.phone}', cpf = '${customerUpdate.cpf}', birthday = '${customerUpdate.birthday}'
            WHERE id = '${id}'
        `);
        res.sendStatus(200);

    } catch (error) {
        res.status(500).send(error);
    };
};

export { getCustomers, getCustomersId, postCustomers, putCustomers };