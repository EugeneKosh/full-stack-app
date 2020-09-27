const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const router = Router();

// api/auth/register
router.post(
    '/register',
    [
        check('email', 'Wrong email').isEmail(),
        check('password', 'Smallest password is 6 symbol').isLength({min: 6})
    ],
    async (request, response) => {
    try {
        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            return response.status(400).json({
                errors: errors.array(),
                message: 'Incorrect registration data'
            })
        }

        const {email, password} = request.body
        const candidate = await User.findOne({email});
        console.log(candidate)
        if (candidate) {
            return response.status(400).json({message: `This user is already registered.`})
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User ({email, password: hashedPassword});

        await user.save();

        response.json({message: `User registered!`})
    } catch (e) {
        response.status(500).json({message: 'Something went wrong, please try again.'})
    }
})
// api/auth/login
router.post(
    '/login',
    [
        check('email', 'Wrong email').normalizeEmail().isEmail(),
        check('password', 'Enter password').exists()
    ],
    async (request, response) => {
        try {
            const errors = validationResult(request);

            if (!errors.isEmpty()) {
                return response.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect login data'
                })
            }

            const {email, password} = request.body;
            const user = await User.findOne({email});
            if (!user) {
                return response(400).json({message: `User is undefined`})
            }

            const isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch) {
                 return response.status(400).json({message: `Password is incorrect`})
             }

                const token = jwt.sign(
                    {userId: user.id},
                    config.get('jwtSecretKey'),
                    {expiresIn: '1h'}
                )

            response(200).json({token, userId: user.id});

        } catch (e) {
            response.status(500).json({message: 'Something went wrong, please try again.'})
        }
})

module.exports = router;