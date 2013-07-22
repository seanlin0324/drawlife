var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var roomSchema = new Schema({
    id:  { type: String },
    name: { type: String },
    bg: { type: String },
    num: { type: Number },
    member: { type: Array },    //房間成員
    people: { type: Number },    //最大人數
    count: { type: Number }     //目前幾人
});

var accountSchema = new Schema({
    id:  { type: String, default: 0 },
    account:  { type: String },
    name: { type: String },
    email: { type: String }
})

var CONFIG = cfg = {
	'mongoDB': process.env.MONGOHQ_URL || 'mongodb://localhost/drawlife',
	'model': {
		'room': 'room',
		'account': 'account'
	}
}

//mongoose.connect('mongodb://localhost/drawlife');
//mongoose.model('test', drawlifeSchema);
//var conn = mongoose.createConnection(cfg.localDB);
var conn = mongoose.createConnection(cfg.mongoDB);
conn.model(cfg.model.room, roomSchema);
conn.model(cfg.model.account, accountSchema);
var Rooms = rooms = conn.model(cfg.model.room);
var Accounts = accounts = conn.model(cfg.model.room);

rooms.insert = addInsert(Rooms);
accounts.insert = addInsert(Accounts);

function addInsert (Obj) {
	return function (data, cb) {
		if(cb) {
			new Obj(data).save(cb);
		} else {
			new Obj(data).save();	
		}
	}
}	

var Mongo = (function () {
	function Mongo () {}
	Mongo.prototype.rooms = rooms;
	Mongo.prototype.accounts = accounts;
	return Mongo;
})()

module.exports = new Mongo();
