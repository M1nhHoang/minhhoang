let db = null;
const shouldUseDatabase = process.env.ENABLE_DATABASE === 'true';

if (shouldUseDatabase) {
    try {
        const dataAccessModel = require('../models/dataAccessModel');
        db = new dataAccessModel.dataAccessModel();
    } catch (error) {
        console.warn('Database connection disabled for chat service:', error.message);
        db = null;
    }
}

const hasDatabase = () => Boolean(db);
const EMPTY_CHAT_LIST = JSON.stringify([
    {
        type: 'bot',
        chatList: []
    },
    {
        type: 'user',
        chatList: []
    }
]);

module.exports = {
    // set user to online or offline
    setStatus: async (id, status) => {
        if (!hasDatabase()) {
            return;
        }
        await db.execute_storedProcedure('psSetOnlineStatus', [id, status]);
    },
    // get chat list
    getChatList: async () => {
        if (!hasDatabase()) {
            return EMPTY_CHAT_LIST;
        }
        const bots = await db.execute_storedProcedure('psGetBots', [1]);
        const users = await db.execute_storedProcedure('psGetUserSatus', [1]);

        // return user + bot json
        return JSON.stringify([
            {
                type: 'bot',
                chatList: bots[0]
            },
            {
                type: 'user',
                chatList: users[0]
            }
        ]);
    },
    
    // send chat list to each socket user
    sendShortMessage: async(chat, socket) => {
        if (!hasDatabase()) {
            const emptyShortMessage = JSON.stringify([]);
            chat.sockets.forEach((connectedSocket) => {
                connectedSocket.emit('server-send-usersShortMessage', emptyShortMessage);
            });
            return;
        }

        // get list of user
        const users = await db.execute_storedProcedure('psGetUserChatList', []);

        chat.sockets.forEach((connectedSocket) => {
            connectedSocket.emit('server-send-usersShortMessage', JSON.stringify(users[0].filter((user) => {
                // // return true if pass sender or recipient else return false
                return connectedSocket.username === user.recipient_name || connectedSocket.username === user.sender_name;
            })));
        });
        
    },
    
    // talk (send and receive message)
    talk: async(chat, socket) => {
        socket.on('client-send-message', async (data) => {
            // if target is chat bot
            if (data.receiverId === "SimSimi"){
                // create answer
                let answer = await module.exports.chatbot_simsimi(data.message);
                // send answer
                socket.emit('server-send-message', JSON.stringify({
                    sender: "SimSimi",
                    status: "succsess",
                    content: answer
                }));
            }
            else{
                // find receive user socket
                chat.sockets.forEach( async (connectedSocket) => {
                    if (connectedSocket.username === data.receiverId){
                        // insert message to database
                        if (hasDatabase()) {
                            await db.execute_storedProcedure('addMessage', [data.sendId, data.receiverId, data.message]);
                        }

                        // send message to client
                        connectedSocket.emit('server-send-message', JSON.stringify({
                            sender: data.sendId,
                            content: data.message
                        }));
                        return;
                    }
                });
            }
        })
    },
    
    // send messageList
    sendMassageList_whenUserTarget: async(chat, socket) => {
        socket.on('client-get-messageList', async (data) => {
            // get message list
            if (!hasDatabase()) {
                socket.emit("server_send_messageList", []);
                return;
            }
            const messageList = await db.execute_storedProcedure('getUserMessage', [data.user, data.target]);

            // send to client
            socket.emit("server_send_messageList", messageList[0]);
        })
    },
    
    // bot simsimi v2
    chatbot_simsimi: (message) => {
        let fs = require('fs');
        let path = require('path');
        let request = require('request')

        // load config
        let configPath = path.join(__dirname, '../config/config.json');
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // create payload
        let payload = {'text': message, 
                        'lc': "vn"}
        // create option
        proxy = config.proxys.proxy_mkvn.split(':')
        proxy = `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`
        
        let option = {
            url: 'https://api.simsimi.vn/v2/simtalk',
            method: 'POST',
            form: payload
            // proxy: proxy
        }
        // request post
        return new Promise((resolve, reject) => {
            request(option, (err, res) => {
                //nếu có lỗi
                if (err)
                    return reject(err);
                //return message
                return resolve(JSON.parse(res.body).message);
            })
        })
    }
}
