import Joi from "joi";

const gamesSchema = Joi.object({
    name: Joi.string().trim().required(),
    image: Joi.string().trim().uri().required(),
    stockTotal: Joi.number().min(1).required(),
    categoryId: Joi.number().required(),
    pricePerDay: Joi.number().min(1).required()
});

export default gamesSchema;