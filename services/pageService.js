let db = null;
const shouldUseDatabase = process.env.ENABLE_DATABASE === 'true';

if (shouldUseDatabase) {
    try {
        const dataAccessModel = require('../models/dataAccessModel');
        db = new dataAccessModel.dataAccessModel();
    } catch (error) {
        console.warn('Database connection disabled:', error.message);
        db = null;
    }
}

const hasDatabase = () => Boolean(db);

module.exports = {
    createNewUser: async () => {
        // create random userid
        let userId = Math.random().toString(36).substr(2, 9);
        if (hasDatabase()) {
            do {
                userId = Math.random().toString(36).substr(2, 9);
                var isExit = await db.execute_storedProcedure("psGetUserName", [userId]);
            } while (isExit[0][0]);
        }

        if (!hasDatabase()) {
            return userId;
        }

        // add user to database
        // get random image
        let fs = require('fs');
        let imagePath = './public/images';
        
        // Read all image in folder
        let randomImage = await new Promise((resolve, reject) => {
            fs.readdir(imagePath, function(err, files) {
                if (err) {
                    reject(err);
                }
                
                // only images
                let imageFiles = files.filter(function(file) {
                    return file.match(/\.(jpg|jpeg|png|gif)$/);
                });
                
                // chosen random image
                let randomIndex = Math.floor(Math.random() * imageFiles.length);
                resolve(imageFiles[randomIndex]);
            });
        });
        
        // insert user to db
        db.execute_storedProcedure("psAddUSER", [userId, null, 'guest', `images/${randomImage}`]);
        
        return userId;
    },
    
    isExitUser: async (userId) => {
        if (!hasDatabase()) {
            return true;
        }
        return (await db.execute_storedProcedure("psGetUserName", [userId]))[0][0];
    },
    
    isLegit: (req) => {
        let userAgent = req.headers['user-agent'];
        let isBrowser = Boolean(userAgent.match(/(Mozilla|Chrome|Safari)/i));
        let checkAccept = req.headers['accept'].includes('text/html');
        
        if (!isBrowser) {
            return 'non vcl -- lần sau request thì thêm cái user-agent vào con gà';
        }
        
        if (!checkAccept) {
            return 'non vcl :))';
        }
    }
} 
