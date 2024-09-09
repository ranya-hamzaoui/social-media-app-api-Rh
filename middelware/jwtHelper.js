    
    const jwt =  require('jsonwebtoken');
    const config = require('../config/configToken.json');

    generateToken = (data) => {
        let token = jwt.sign({ user: data}, 
            config.TOKEN_SECRET_KEY, 
            {expiresIn: config.EXPIRE_JWT,algorithm :config.ALGORITHM_JWT}
            );
        return token
    }
    generateRefreshToken = (data) => {
        const refreshToken = jwt.sign(
            { user: data},config.REFRESH_SECRET_KEY, 
            {expiresIn: config.EXPIRE_JWT_REFRESH,algorithm :config.ALGORITHM_JWT}
            );
        return refreshToken
    }
    module.exports = {
        generateToken,
        generateRefreshToken
    }