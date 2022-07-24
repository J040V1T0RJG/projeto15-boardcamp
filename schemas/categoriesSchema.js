import Joi from "joi";

const categoriesSchema = Joi.object({
    name: Joi.string().trim().required()
});

export default categoriesSchema;