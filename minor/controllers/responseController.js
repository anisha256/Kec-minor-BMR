exports.user= async (req, res, next) => {
	try {
		console.log(req.user,
			req.blockchain)
		return res.render('quote',{
			sucess: true,
			data: {
				message: 'Success',
				user: req.user,
				blockchain: req.blockchain,
			}
		});
	} catch (error) {
		console.log("user response controller")
		return next(error);
		
	}
};

exports.ca = async (req, res, next) => {
	try {
		return res.render('index',{
			sucess: true,
			data: {
				message: 'Success',
				ca: req.ca,
			},
		});
	} catch (error) {
		console.log("ca response controller")
		return next(error);
	}
};
