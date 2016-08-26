/** The user object **/
var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName: 'employees',
    idAttribute: 'username',
});

module.exports = {
    User: User
};
