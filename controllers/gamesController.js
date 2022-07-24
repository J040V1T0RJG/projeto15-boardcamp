import Trim from "trim";
import connection from "../dbStrategy/postgres.js";
import gamesSchema from "../schemas/gamesSchema.js";

const getGames = async (req, res) => {
    const name = req.query.name;

    try {
        if (name) { 
            const { rows: findNameThatStarts } = await connection.query(`SELECT * FROM games WHERE name LIKE '${name}%'`);
            res.status(200).send(findNameThatStarts);
            return;
        };

        const { rows: gamesTableArray } = await connection.query(`SELECT * FROM games`);
        res.status(200).send(gamesTableArray);

    } catch (error) {
        res.status(500).send(error);
    };    
};

const postGames = async (req, res) => {
    const game = req.body;
    const { error: errorGameSchema } = gamesSchema.validate(game, { abortEarly: false});

    try {
        const { rows: evaluatesIfCategoryIdExists } = await connection.query(`SELECT * FROM categories WHERE id = '${game.categoryId}'`);
        const { rows: evaluatesIfNameExists } = await connection.query(`SELECT * FROM games WHERE name = '${game.name}'`)

        if(errorGameSchema || !evaluatesIfCategoryIdExists[0]) {
            res.sendStatus(400);
            return;
        };

        if (evaluatesIfNameExists[0]) {
            res.sendStatus(409);
            return;
        };

        const insertGameInTableGames = await connection.query(`
            INSERT INTO games 
            (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES ('${game.name}', '${game.image}', '${game.stockTotal}', '${game.categoryId}', '${game.pricePerDay}')
        `);
        res.status(200).send(insertGameInTableGames);
        
    } catch (error) {
        console.log("error:", error)
        res.status(500).send(error);
    };
};

export { getGames, postGames };
