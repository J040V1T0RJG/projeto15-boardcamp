import connection from "../dbStrategy/postgres.js";
import categoriesSchema from "../schemas/categoriesSchema.js";

const getCategories = async (req, res) => {
    try {
        const { rows: categories } = await connection.query(`SELECT * FROM categories`);
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send(error);
    };
};

const postCategories = async (req, res) => {
    const { name } = req.body;
    const { error: errorCategoriesSchema } = categoriesSchema.validate({name: name}, { abortEarly: false});

    if (errorCategoriesSchema) {
        res.sendStatus(400);
        return;
    };

    try { 
        const { rows: evaluatesIfNameExists } = await connection.query(`SELECT * FROM categories WHERE name = '${name}'`);
        if (evaluatesIfNameExists[0]) {
            res.sendStatus(409);
            return;
        };

        const insertNameInsideCategory = await connection.query(`INSERT INTO categories (name) VALUES ('${name}')`);
        res.sendStatus(201);

    } catch (error) {
        res.status(500).send(error);
    };
};

export { getCategories, postCategories };