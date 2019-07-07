const db = require('../../../../db');
const { imageUrl } = require('../../../../helpers');

module.exports = async (req, res, next) => {
    try {
        const { product_id } = req.params;

        if (!product_id) {
            throw new StatusError(422, 'Missing product ID');
        }

        const [[product = null]] = await db.execute(
            'SELECT p.pid AS productId, p.caption, p.cost, p.description, p.name, im.pid AS imageId, im.altText AS imageAltText, im.file AS imageFile, im.type AS imageType, tn.pid AS tnId, tn.altText AS tnAltText, tn.file AS tnFile, tn.type AS tnType FROM products AS p JOIN images AS im ON p.imageId=im.id JOIN images AS tn ON p.thumbnailId=tn.id WHERE p.pid=?',
            [product_id]
        );

        if (!product) {
            throw new StatusError(422, 'Invalid product ID');
        }

        res.send({
            id: product.productId,
            caption: product.caption,
            cost: product.cost,
            description: product.description,
            name: product.name,
            image: {
                id: product.imageId,
                altText: product.imageAltText,
                file: product.imageFile,
                type: product.imageType,
                url: imageUrl(req, product.imageType, product.imageFile)
            },
            thumbnail: {
                id: product.tnId,
                altText: product.tnAltText,
                file: product.tnFile,
                type: product.tnType,
                url: imageUrl(req, product.tnType, product.tnFile)
            }
        });
    } catch (error) {
        next(error);
    }
}
