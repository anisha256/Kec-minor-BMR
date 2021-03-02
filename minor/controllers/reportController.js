const User = require('../models/User');

// exports.createReport = async (req, _res, next) => {
// 	try {
// 		const { doctorName,patientName,description,height,weight} = req.body;

// 		req.user = await User.create({
// 			doctorName: doctorName,
//             patientName: patientName,
// 			hospitalName: process.env.MSPID,
// 			description:description,
// 			height: height,
//             weight: weight
// 		});

// 		req.blockchainFunc = 'CreateReport';

// 		return next();
// 	} catch (error) {
// 		return next(error);
// 	}
// };

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
};
exports.updateReportByID = async (req, _res, next) => {
    try{
        console.log(req.query);
        console.log(req.body.id)
        const {id} =req.query;
        req.user = await User.findById(id);
        req.blockchainFunc = 'UpdateReport';

        return next();
    }
    catch(error){
        return next(error)
    }
};
// exports.getReportsFromUser = async (req, _res, next) => {
// 	try {
// 		req.user = await User.find(doctorName);

// 		req.blockchainFunc = 'ReadReportFromUser';

// 		req.query.id = doctorName;

// 		return next();
// 	} catch (error) {
// 		return next(error);
// 	}
// };

exports.getReports = async (req, _res, next) => {
	try {
		req.user = await User.find({});

		req.blockchainFunc = 'GetAllReports';

		return next();
	} catch (error) {
		return next(error);
	}
};