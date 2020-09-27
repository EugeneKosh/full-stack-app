const {Router} = require('express')
const Link = require('../models/Link')
const router = Router()

router.get('/:code', async (request, response) => {
    try {
        const link = Link.findOne({ code: request.params.code })
        if (link) {
            link.click++
            await link.save()
            return response.redirect(link.from)
        }
        response.status(404).json('Link not found')

    } catch (e) {
        response.status(500).json({ message: 'Something went wrong!'})
    }
})

module.exports = router