const db = require(__root + '/db');
const { imageUrl } = require(__root + '/helpers');

module.exports = async (req, res, next) => {
    try {
        const [result] = await db.query('SELECT p.pid AS id, p.caption, p.cost, p.name, i.pid AS thumb_id, i.altText, i.file, i.type FROM products AS p JOIN images AS i ON p.thumbnailId=i.id');

        const products = result.map((product) => {
            return {
                id: product.id,
                caption: product.caption,
                cost: product.cost,
                name: product.name,
                thumbnail: {
                    id: product.thumb_id,
                    altText: product.altText,
                    file: product.file,
                    type: product.type,
                    url: imageUrl(req, product.type, product.file)
                }
            }
        });

        res.send({ products });
    } catch (error) {
        next(error);
    }
}
