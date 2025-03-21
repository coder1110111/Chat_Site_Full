const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Group = require('../models/group');
const Chat = require('../models/chat');
const Connector = require('../models/connector');

let io;

const socketIo = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: '*',
                method: ['GET', 'POST']
            }
        });

        io.use(async (socketIo, next) => {
            const token = socketIo.handshake.auth.token;

            if(!token) {
                console.log(' !!! No Token, Connection Failed!!!');
                return next(new Error("Unauthorized: Please Login Again"));
            }

            try {
                const decode = jwt.verify(token, process.env.JWT_KEY);
                const user = await User.findByPk(decode.id);

                if(!user) {
                    console.log("!!! User Not Found !!!");
                    return next(new Error("Unauthorized: No such User exist"));
                }

                socketIo.user = user;
                console.log(`User authenticated: ${user.name}`);
                next();
            } catch(error) {
                console.log("!!! JWT authentication failed : ", err);
                return next(new Error("Unauthorized"));
            }
        });

        io.on('connection', async (socket) => {     //Here is where user connects with websocket server
            console.log('in Console for user connection to socket');
            console.log(`User Connected : ${socket.user.name} (${socket.user.id})`);

            socket.on('join-group', async(data) => {        //When user opens a group
                const {groupId} = data;
                console.log('in socket for join-group');
                try {
                    const group = await Group.findOne({ where: {group_id: groupId} });
                    if(!group) {
                        console.log('!!! Group not Found');
                        socket.emit('error', {message: 'Group not Found'});
                        return;
                    }

                    const connection = await Connector.findOne({where: {
                        group_id: groupId,
                        user_id: socket.user.id
                        }
                    });

                    if(!connection) {
                        console.log("!!! User not part of the group");
                        socket.emit('error', {message: 'Not a member of this group'});
                        return;
                    }

                    socket.join(groupId);
                    console.log(`User Joined Group: ${group.group_name}`);
                    socket.emit('joined-group', { groupname: group.group_name});
                } catch(error) {
                    console.error('!!! Error joining group: ', error);
                    socket.emit('error', {message: '!!! Failed to join Group !!!'});
                }
                
            });

            socket.on('send-message', async (data) => {
                const { groupId, message } = data;

                try{
                    const connection = await Connector.findOne({
                        where: {
                            group_id: groupId,
                            user_id: socket.user.id
                        }
                    });

                    if (!connection) {
                        console.log(' User not part of this group');
                        socket.emit('error', { message: 'Cannot send message in this group'});
                        return;
                    }
                    
                    //This stores the sent message to the database
                    const chat = await Chat.create({
                        message_content: message,
                        sent_by: socket.user.name,
                        group_id: groupId
                    });

                    //This Broadcasts the same message as live message to the group
                    io.to(groupId).emit('receive-message', {
                        chat_id: chat.chat_id,
                        message_content: chat.message_content,
                        sent_by: socket.user.name
                    });
                } catch(error) {
                    console.error('!!! X Error sending message: ', error);
                    socket.emit('error', {message: 'Failed to send message'});
                }
            });

            socket.on('disconnect', () => {
                console.log(`XX User Disconnected: ${socket.id}`);
            });
        });

        return io;
    },

    getIO: () => {
        if(!io) {
            throw new Error('Socket.io not initiated');
        }
        return io;
    }
};

module.exports = socketIo;