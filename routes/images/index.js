const router = require('express').Router();
const fs = require('fs');
const { resolve } = require('path');

/*
    /images
*/

router.get('/:type/:file', async (req, res, next) => {
    try {
        const { params } = req;
        const filePath = resolve(__root, 'client_assets', 'products', params.type, params.file);

        if(fs.existsSync(filePath)){
            return res.sendFile(filePath);
        }

        throw new StatusError(404, 'Image not found');
    } catch(error) {
        next(error);
    }
});

module.exports = router;
