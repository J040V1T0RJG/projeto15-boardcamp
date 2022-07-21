import connection from "../dbStrategy/postgres"

const getCategories = async (req, res) => {
    const query = await client.query("SELECT * FROM categories");
    console.log("query", query)
}

const postCategories = async (req, res) => {

}

export { getCategories, postCategories };