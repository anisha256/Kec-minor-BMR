const User = require('../models/User');

exports.getReportByID = async (req, _res, next) => {
    try{
        console.log(req.query);
        console.log(req.body.id)
        const {id} =req.query;
        req.user = await User.findById(id);
        req.blockchainFunc = 'ReadReport';

        return next();
    }
    catch(error){
        return next(error)
    }
}