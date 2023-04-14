import { Router } from 'express';

const router = Router();

router .get('/', (req, res) => {
    res.render('index');
});

router .post('/', (req, res) => {
    console.log(req.body.URLList)
    res.redirect('/environment')
});

// Manuel HTTP Reuest within Form
//https://github.com/expressjs/body-parser


export default router;