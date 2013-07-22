var utils = require( 'connect' ).utils;  // utils.uid(10)選機產生亂數
var db = require('./mongo');


var RoomDB = (function(){
	var that;
	function RoomDB () { this._init() }
	RoomDB.prototype._init = function () {
		var home = {
			id: '0000000000000',
			bg: '4',
			name: 'home',
			people: 100,
			count: 0
		}
		this.hallRoomId = home.id;
		that = this;
		this.room = [];
		db.rooms.remove({}, function(err, data) {
			db.rooms.insert(home, function(err, data) {
				db.rooms.find({}, '-_id', function (err, data) {
					that.room = data;
				})	
			})	
		})
	}

	RoomDB.prototype.getRoomId = function () {
		var currentTime = (new Date()).valueOf().toString();
		//var random = Math.random().toString();
		var random = utils.uid(10).toString();
		return currentTime;
		//return global.crypto.createHash('md5').update(currentTime + random).digest('hex');
	}

	RoomDB.prototype.getRooms = function (cb) {
		db.rooms.find({}, '-_id').sort({id:1}).exec(function (err, data) {
			that.room = data;
			cb();
		})
	}

	RoomDB.prototype.addRooms = function (info, cb) {
		var roomData = {
			id: info.id,
			name: info.name,
			bg: info.bg,
			//num: num,
			member: [],
			people: info.people,
			count: 0
		}
		db.rooms.insert(roomData, function(err, data) {
			that.getRooms(cb);
		})
	}
	RoomDB.prototype.findRoom = function (rid) {
		var room = this.room;
		var roomId, usrRoomId, idx;
		usrRoomId = rid;
		room.some(function(obj, key){
		  roomId = obj.id;
		  if(roomId == usrRoomId) {
		    idx = key;
		    return true;
		  }
		})
		return idx;		
	}
	RoomDB.prototype.sortRoom = function () {
		room.sort(function(a, b){
		    return a.num - b.num;
		})
	}

	RoomDB.prototype.changeRoom = function (user, oldRoom, newRoom, cb) {
	
		this.leaveRoom(user, oldRoom, function(){
			that.intoRoom(user, newRoom, cb);	
		})
		
	}

	RoomDB.prototype.intoRoom = function (user, newRoom, cb) {
		user.room = {
			id: newRoom.id,
			name: newRoom.name
			//num: _room.num
		};

		db.rooms.findOne({id: user.room.id}, function(err, room){
			room.member.push(user);
			room.count = room.member.length;
			room.save(function(){
				that.getRooms(cb);	
			});
		})

		//newRoom.member.push(user);
		//newRoom.count = _room.member.length;
		
	}

	RoomDB.prototype.leaveRoom = function (user, oldRoom, cb) {
		var memRoomId, usrRoomId, idx, _room, i, hallRoomID;
		hallRoomId = this.hallRoomId;
		usrRoomId = user.room.id;
		//console.log('user = ' + user)
		//console.log(user)
		//idx = findRoom(usrRoomId);
		
		//_room = oldRoom;

		//console.log('usrRoomId = ' + usrRoomId)
		//console.log('idx = ' + idx)
		

		db.rooms.findOne({id: user.room.id}, function(err, room){
			for(i in room.member){
				if(room.member[i].id == user.id) break;
			}
			room.member.splice(i,1);
			room.count = room.member.length;
			/* 如果房間沒人就刪除房間 */
			if (!room.member.length && room.id != hallRoomId){
				db.rooms.remove({id: room.id}, function(err, info){
					if (!err) {
						that.getRooms(cb);
					}
				})
			} else {
				room.save(function(){
					that.getRooms(cb);	
				});
			}	
		})

		//console.log('i = ' + i);
		//console.log(_room.member);
		//_room.member.splice(i,1);
		//_room.count = _room.member.length;
		
		
		
	}
	return RoomDB;
})()

module.exports = new RoomDB();

//Inert ingo MongoDB
//~ var pushBuffer = function(data) {
//~ new chat_history(data).save();
//~ }

/*
var addRooms = function(info) {
function availableNum(){
  var idx = 0;
  if(room.length){
    for(idx in room){
      if(room[idx].num == idx){
        idx++;
      } else {
        break;
      }
    }
  } 
  return idx;
}

var num = availableNum();

return {
  id: info.id,
  name: info.name,
  bg: info.bg,
  num: num,
  member: [],
  people: info.people,
  count: 0
}
}

var findRoom = function(rid){
var roomId, usrRoomId, idx;
usrRoomId = rid;
room.some(function(obj, key){
  roomId = obj.id;
  if(roomId == usrRoomId) {
    idx = key;
    return true;
  }
})
return idx;
}


var sortRoom = function(){
room.sort(function(a, b){
    return a.num - b.num;
})
}

var intoRoom = function(user, _room){
user.room = {
  id: _room.id,
  name: _room.name,
  num: _room.num
};
_room.member.push(user);
_room.count = _room.member.length;
io.sockets.in(user.room.id).emit('users', _room.member);
}

var leaveRoom = function(user){
var memRoomId, usrRoomId, idx, _room, i;
usrRoomId = user.room.id;
//console.log('user = ' + user)
//console.log(user)
idx = findRoom(usrRoomId);
_room = room[idx];
//console.log('usrRoomId = ' + usrRoomId)
//console.log('idx = ' + idx)
for(i in _room.member){
  if(_room.member[i].id == user.id) break;
}
//console.log('i = ' + i);
//console.log(_room.member);
_room.member.splice(i,1);
_room.count = _room.member.length;
io.sockets.in(user.room.id).emit('users', _room.member);
if (!_room.member.length && _room.id != '0000') room.splice(idx, 1);
}

var changeRoom = function(so, newRoom){
so.get('username', function(err, user) {
  if (!user) return false;
  so.leave(user.room.id);
  so.join(newRoom.id);
  //user.room = newRoom;
  leaveRoom(user)
  intoRoom(user, newRoom);
  so.set('username', user, function() {
    
  })
})



*/


//~ so.broadcast.to('justin bieber fans').emit('new fan');
//~ io.sockets.in('rammstein fans').emit('new non-fan');
//~ io.sockets.emit('createroom', uid);

//**  insert **//
/*
new rooms(home).save(function(err, finish){
	if(err) {
		console.log(err);
	} else {
		console.log(finish);
		rooms.find(function(err, data){
			if(err) {
				console.log(err);
			} else {
				console.log(data);
			}
		});
	}

});
*/