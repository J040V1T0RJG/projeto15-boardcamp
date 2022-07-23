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
    const { error } = categoriesSchema.validate({name: name}, { abortEarly: false});

    if (error) {
        res.sendStatus(400);
        return;
    };

    try {
        const { rows: evaluatesRepeatedName } = await connection.query(`SELECT * FROM categories WHERE name = '${name}'`);
        if (evaluatesRepeatedName[0]?.name) {
            res.sendStatus(409);
            return;
        };

        const insertNameInsideCategory = await connection.query(`INSERT INTO categories (name) VALUES ('${name}')`);
        res.status(201).send(insertNameInsideCategory);

    } catch (error) {
        res.status(500).send(error);
    };
};

export { getCategories, postCategories };