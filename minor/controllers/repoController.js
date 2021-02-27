const User = require('../models/User');



exports.getReportByID = async (req, _res, next) => {
	try {
		const { id } = req.query;

		req.user = await User.findByID(id);

		req.blockchainFunc = 'ReadReport';
        

		return next();
	} catch (error) {
		return next(error);
	}
};