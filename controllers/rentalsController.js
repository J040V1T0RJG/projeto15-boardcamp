import dayjs from "dayjs"
import connection from "../dbStrategy/postgres.js";
import rentalsSchema from "../schemas/rentalsSchema.js";

const getRentals = async (req, res) => {
    const customerId = req.query.customerId;
    const gameId = req.query.gameId;

    try {
        if (customerId && gameId) {
            console.log("passouTUDO")
            const { rows: requestedCustomersAndGames } = await connection.query(`
                SELECT * FROM rentals WHERE rentals."customerId" = '${customerId} OR rentals."gameId" = '${gameId}'
            `);
            res.status(200).send(requestedCustomersAndGames);
            return;
        };
        if (customerId) {
            console.log("passouCLIENTE")
            const { rows: onlyRequestedCustomers } = await connection.query(`SELECT * FROM rentals WHERE "customerId" = '${customerId}'`);
            res.status(200).send(onlyRequestedCustomers);
            return;
        };
        if (gameId) {
            console.log("passouGAME")
            const { rows: onlyRequestedGames } = await connection.query(`SELECT * FROM rentals WHERE "gameId" = '${gameId}'`);
            res.status(200).send(onlyRequestedGames);
            return;
        };

        const { rows: rentalsList } = await connection.query(`
            SELECT rentals.*,
            row_to_json(customers) AS customer,
            row_to_json(games) AS game
            FROM rentals
            JOIN (SELECT id, name FROM customers) customers
            ON rentals."customerId" = customers.id
            JOIN (SELECT g.id, g.name , g."categoryId", c.name AS "categoryName" FROM games AS g JOIN categories AS c ON c.id = g."categoryId") games
            ON rentals."gameId" = games.id
        `);

        res.status(200).send(rentalsList);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    };
};

const postRentals = async (req, res) => {
    const rental = req.body;
    const { error: errorRentalsSchema } = rentalsSchema.validate(rental, { abortEarly: false});

    try {
        const { rows: evaluatesIfCustomerIdExists } = await connection.query(`SELECT * FROM customers WHERE id = '${rental.customerId}'`);
        const { rows: evaluatesIfGameIdExists } = await connection.query(`SELECT * FROM games WHERE id = '${rental.gameId}'`);
        const { rows: alugueistock } = await connection.query(`SELECT * FROM rentals WHERE "gameId" = '${rental.gameId}'`);

        const rentsAlreadyMade = alugueistock.length;
        const maximumAllowedStock = evaluatesIfGameIdExists[0]?.stockTotal;
        const pricePerDayGame = evaluatesIfGameIdExists[0]?.pricePerDay;
        const now = dayjs().format('YYYY-MM-DD');

        if (errorRentalsSchema || !evaluatesIfCustomerIdExists[0] || !evaluatesIfGameIdExists[0] || (rentsAlreadyMade > maximumAllowedStock - 1)) {
            res.sendStatus(400);
            return;
        };

        const fullRentalData = {
            ...rental,
            rentDate: now,
            returnDate: null,
            originalPrice: Number(rental.daysRented * pricePerDayGame),
            delayFee: null   
        };

        const insertRentalInTableRentals = await connection.query(`
            INSERT INTO rentals
            ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
            VALUES (${fullRentalData.customerId}, ${fullRentalData.gameId}, '${fullRentalData.rentDate}', ${fullRentalData.daysRented},
                    ${fullRentalData.returnDate}, ${fullRentalData.originalPrice}, ${fullRentalData.delayFee})
        `);
        res.sendStatus(201);
        
    } catch (error) {
        res.status(500).send(error);
    };
};

const postRentalsId = async (req, res) => {
    const rentalId = req.params.id;
    const now = dayjs().format('YYYY-MM-DD');

    try {
        const { rows: rental } = await connection.query(`SELECT * FROM rentals WHERE id = '${rentalId}'`);
        console.log(rental[0])

        if (!rental[0]) {
            res.sendStatus(404);
            return;
        };
        if (rental[0].returnDate !== null) {
            res.sendStatus(400);
            return;
        };
        
        const d1 = rental[0].rentDate;
        const d2 = now;

        const diffInMs   = new Date(d2) - new Date(d1);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        const delayPrice = (diffInDays - rental[0].rentDate) * 15;
        let delayFee = 0;
        if (delayPrice > 0) {
            delayFee = delayPrice;
        };

        const updateRentalInTableRentals = await connection.query(`
            UPDATE rentals
            SET "returnDate" = '${now}', "delayFee" = ${delayFee}
            WHERE id = '${rentalId}'
        `);
        res.sendStatus(200);

    } catch (error) {
        res.status(500).send(error);
    };
};

const deleteRentals = async (req, res) => {
    const rentalId = req.params.id;

    try {
        const { rows: rental } = await connection.query(`SELECT * FROM rentals WHERE id = '${rentalId}'`);

        if (!rental[0]) {
            res.sendStatus(404);
            return;
        };
    
        if (rental[0].returnDate === null) {
            res.sendStatus(400);
            return;
        };
    
        const deleteRentalInTableRentals = await connection.query(`DELETE FROM rentals WHERE id = '${rentalId}'`);
    
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error);
    };
};

export { getRentals, postRentals, postRentalsId, deleteRentals };