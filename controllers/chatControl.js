const path = require('path');

exports.getMainPage = (req, res) => {
    console.log('Get Main chat page');
    res.sendFile(path.join(__dirname, '..', 'view', 'main.html'));
}