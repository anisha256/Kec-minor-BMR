const jwt = require('jsonwebtoken');

module.exports =(req,res,next)=> {
    try{
    const decode = jwt.verify(res.body.token, config.secret);
    req.userData = decode;
    next();    
    } catch(error){
        console.log(error)
        return res.status(401).json({message :'Auth failed'})
    } 
}