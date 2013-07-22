'use strict';

module.exports = function(app) {
    var io = require('socket.io').listen(app);
    var roomDB = require('./db');

    io.configure(function() {
        io.set('log level', 2);
    });

    // Recordss buffer
    var room = [];
    var buffer = [];
    var users = [];
    var systemUser = {
        name: '系統',
        id: '0000'
    };

    var addUsers = function(user) {
        users.push(user);
        users.sort();
    };

    var removeUsers = function(user) {
        var key = users.indexOf(user);
        users.splice(key, 1);
    };

    var messageData = function(user, time, msg) {
        return {
            from : user.name,
            post_time: time,
            msg : msg
        };
    };

    var getUserData = function(user) {
        return {
            id: user.id,
            name: user.name,
            link: user.link,
            gender: user.gender
        };
    };

    io.sockets.on('connection', function(socket) {
        var room = roomDB.room;
        socket.join(room[0].id);
        // When user joins
        socket.on('join', function(user) {
            socket.get('username', function(err, player) {
                var msg = user.name + " 開始繪「塗」人生";
                var data = messageData(systemUser, new Date(), msg);
                if (!player) {
                    //user.room = room[0];
                    player = getUserData(user);
                    roomDB.intoRoom(player, room[0], function() {
                        room = roomDB.room;

                        io.sockets.in(room[0].id).emit('users', room[0].member);
                        socket.set('username', player, function() {
                            addUsers(player);
                        });
                        io.sockets.in(player.room.id).emit('system', data);
                        io.sockets.in(room[0].id).emit('createroom', room);
                    });
                    // Set new username

                } else {
                    room = roomDB.room;
                    user = player;
                    io.sockets.in(player.room.id).emit('system', data);
                    io.sockets.in(room[0].id).emit('createroom', room);
                }
            });
        });

        socket.on('create', function(roomInf) {
            socket.get('username', function(err, user) {

                if (err) {
                    return false;
                }

                var newRoomId, oldRoomId, newRoom, oldRoom;
                newRoomId = roomInf.id = roomDB.getRoomId();
                oldRoomId = user.room.id;

                roomDB.addRooms(roomInf, function() {
                    newRoom = roomDB.room[roomDB.findRoom(newRoomId)];
                    oldRoom = roomDB.room[roomDB.findRoom(oldRoomId)];
                    roomDB.changeRoom(user, oldRoom, newRoom, function() {
                        room = roomDB.room;
                        newRoom = roomDB.room[roomDB.findRoom(newRoomId)];
                        oldRoom = roomDB.room[roomDB.findRoom(oldRoomId)];
                        socket.leave(oldRoomId);
                        socket.join(newRoomId);
                        socket.set('username', user);
                        if (oldRoom) {
                            io.sockets.in(oldRoom.id).emit('users', oldRoom.member);
                        }
                        if (newRoom) {
                            io.sockets.in(newRoom.id).emit('users', newRoom.member);
                        }

                        socket.emit('intoroom', newRoom);
                        io.sockets.in(room[0].id).emit('createroom', room);
                    });
                });
            });
        });

        socket.on('select', function(rid) {
            socket.get('username', function(err, user) {

                var newRoomId, oldRoomId, selRoom, oldRoom;
                oldRoomId = user.room.id;
                newRoomId = rid;
                selRoom = roomDB.room[roomDB.findRoom(newRoomId)];
                oldRoom = roomDB.room[roomDB.findRoom(oldRoomId)];
                roomDB.changeRoom(user, oldRoom, selRoom, function() {
                    room = roomDB.room;
                    selRoom = roomDB.room[roomDB.findRoom(newRoomId)];
                    oldRoom = roomDB.room[roomDB.findRoom(oldRoomId)];
                    socket.leave(oldRoomId);
                    socket.join(newRoomId);
                    socket.set('username', user);  //user 已進入changeRoom改過數值
                    if (oldRoom) {
                        io.sockets.in(oldRoom.id).emit('users', oldRoom.member);
                    }
                    if (selRoom) {
                        io.sockets.in(selRoom.id).emit('users', selRoom.member);
                    }
                    socket.emit('intoroom', selRoom);
                    io.sockets.in(room[0].id).emit('createroom', room);
                });
            });
        });

        // When user leaves
        socket.on('disconnect', function() {
            socket.get('username', function(err, user) {
                if (!user) {
                    return false;
                }
                removeUsers(user);
                var msg = user.name + " 離開繪「塗」人生";
                var data = messageData(systemUser, new Date(), msg);
                var oldRoom = roomDB.room[roomDB.findRoom(user.room.id)];

                socket.leave(user.room.id);
                roomDB.leaveRoom(user, oldRoom, function() {
                    room = roomDB.room;
                    oldRoom = room[roomDB.findRoom(user.room.id)];
                    io.sockets.in(oldRoom.id).emit('users', oldRoom.member);
                    io.sockets.in(room[0].id).emit('createroom', room);
                    io.sockets.in(user.room.id).emit('system', data);
                });
                //io.sockets.in(user.room.id).emit('users', users);
            });
        });
        // When user gets Message
        socket.on('msg', function(msg) {
            // Add in check if Records isn't empty
            if (msg && msg.length < 1) {
                return false;
            }
            // Get username first
            socket.get('username', function(err, user) {
            //console.log("username username = "+username);
                var data = messageData(user, new Date(), msg);
                // Broadcast the data
                // socket.broadcast.emit('msg', data);
                socket.broadcast.to(user.room.id).emit('msg', data);
            });
        });

        // When user gets Draw Canvas
        socket.on('draw', function(drawInf) {
            socket.get('username', function(err, user) {
                socket.broadcast.to(user.room.id).emit('draw', drawInf);
            });
        });

        // When user gets Clear Canvas
        socket.on('clear', function() {
            socket.get('username', function(err, user) {
                socket.broadcast.to(user.room.id).emit('clear');
            });
        });
        return io;
    });

};
