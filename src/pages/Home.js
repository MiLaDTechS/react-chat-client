import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react'
import { RiLogoutCircleRLine, RiUserSettingsLine } from 'react-icons/ri';
import { useHistory } from 'react-router-dom';
import ReactTooltip from "react-tooltip";
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/dist/plugins/overscroll';
import { useSocket } from '../contexts/SocketContext';
import { CustomValidationModule, useImmer, useLocalStorage } from '../utils';

Scrollbar.use(OverscrollPlugin);

const initialMessages = {
    general: [],
    random: [],
    jokes: [],
    javascript: [],
    privateMessages: []
}

const rooms = [
    'general',
    'random',
    'jokes',
    'javascript'
];

const Home = () => {
    const history = useHistory();
    const socket = useSocket();
    const [currentChat, setCurrentChat] = useState({ isChannel: true, chatName: 'general', receiverId: '' });
    const [connectedRooms, setConnectedRooms] = useImmer(['general']);
    const [allUsers, setAllUsers] = useState([]);
    const [messages, setMessages] = useImmer(initialMessages);
    const [message, setMessage] = useState('');
    const { value: user, removeItem: removeUser } = useLocalStorage('user');
    const messageListScrollRef = useRef(null);

    useEffect(() => {
        Scrollbar.init(document.getElementById('chat-list'));
        messageListScrollRef.current = Scrollbar.init(document.getElementById('message-list'));
    }, [])

    useEffect(() => {
        messageListScrollRef.current.scrollTo(0, messageListScrollRef.current.contentEl.clientHeight)
    }, [currentChat])

    useEffect(() => {

        socket.auth = {
            token: user?.token
        }

        socket.emit('join server', { nickname: user?.nickname, isLogin: false }, ({ prevMessages, users, userExist }) => {
            setMessages(prevMessages);
            !userExist && setAllUsers(users);
        });

        socket.on('new user', (users) => {
            setAllUsers(users);
        });

        socket.on('new message', ({ content, chatName, sender, isChannel }) => {

            setMessages(draft => {
                roomMessageLimiter(draft);

                if (isChannel) {
                    draft[chatName].push({ content, sender });
                }
                else {

                    const pvIndex = draft.privateMessages.findIndex(pv => {
                        return [sender, chatName].every(i => pv.between.includes(i));
                    });

                    if (pvIndex > -1) {
                        draft.privateMessages[pvIndex].messages.push({ sender, content });
                    } else {
                        draft.privateMessages.push({ between: [sender, chatName], messages: [{ sender, content }] })
                    }
                }
            });

        });

        !socket.connected && socket.open();

        return () => {
            socket.off('new user').off('new message');
            socket.close();
        }

    }, [socket, user, setMessages])

    useEffect(() => {
        setTimeout(() => {
            const lastMessage = document.querySelector('#message-list li:last-child');
            messageListScrollRef.current.scrollIntoView(lastMessage);
        }, 10);
        setMessage('');
    }, [messages]);

    const roomMessageLimiter = (prevMessages) => {
        for (const room in prevMessages) {
            if (Object.hasOwnProperty.call(prevMessages, room)) {
                if (room !== 'privateMessages') {
                    const roomMessages = prevMessages[room];
                    if (roomMessages.length >= 50) {
                        roomMessages.splice(0, 1);
                    }
                }
            }
        }
    }

    const handleMessageChange = ({ target, target: { value } }) => {
        CustomValidationModule.onSubmit(target);
        setMessage(value);
    }

    const sendMessage = (e) => {
        e.preventDefault();

        const payload = {
            content: message,
            to: currentChat.isChannel ? currentChat.chatName : currentChat.receiverId,
            sender: user?.nickname,
            chatName: currentChat.chatName,
            isChannel: currentChat.isChannel
        }

        socket.emit('send message', payload);

        setMessages(draft => {
            roomMessageLimiter(draft);

            if (payload.isChannel) {
                draft[payload.chatName].push({ content: payload.content, sender: payload.sender });
            }
            else {

                const pvIndex = draft.privateMessages.findIndex(pv => {
                    return [payload.sender, payload.chatName].every(i => pv.between.includes(i));
                });

                if (pvIndex > -1) {
                    draft.privateMessages[pvIndex].messages.push({ sender: payload.sender, content: payload.content });
                } else {
                    draft.privateMessages.push({ between: [payload.sender, payload.chatName], messages: [{ sender: payload.sender, content: payload.content }] })
                }
            }
        });
    }

    const roomJoinCallback = (prevMessages, room) => {
        setMessages(draft => { draft[room] = prevMessages });
    }

    const joinRoom = (room) => {
        socket.emit('join room', room, (prevMessages) => roomJoinCallback(prevMessages, room));
        setConnectedRooms(draft => { draft.push(room) })
    }

    const toggleChat = (currentChat) => {
        setCurrentChat(currentChat);
    }

    let messagesBody;
    if (currentChat.isChannel) {
        if (connectedRooms.includes(currentChat.chatName)) {
            messagesBody = (
                <ul className="text-xs">
                    {messages[currentChat.chatName].map((msg, index) => (
                        <li className="break-all py-0.5" key={index}>
                            <b className={`${msg.sender === user?.nickname && 'text-blue-700'}`}>{msg.sender}: </b>
                            {msg.content}
                        </li>
                    ))}
                </ul>
            );
        } else {
            messagesBody = (
                <div className="flex justify-center items-center" style={{ height: 'calc(100vh - 100px - 60px)' }}>
                    <button
                        type="button"
                        className="text-sm font-bold text-white px-8 py-2.5 rounded-lg focus:outline-none bg-green-600"
                        onClick={() => joinRoom(currentChat.chatName)}
                    >
                        Join room: {currentChat.chatName}
                    </button>
                </div>
            )
        }
    } else {
        const pvIndex = messages.privateMessages.findIndex(pv => {
            return [user?.nickname, currentChat.chatName].every(i => pv.between.includes(i));
        });

        messagesBody = (
            <ul className="text-xs">
                {messages.privateMessages[pvIndex]?.messages.map((msg, index) => (
                    <li className="break-all py-0.5" key={index}>
                        <b className={`${msg.sender === user?.nickname && 'text-blue-700'}`}>{msg.sender}: </b>
                        {msg.content}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
        >
            <ReactTooltip type="light" effect="solid" />
            <div>
                {/* Header */}
                <div className="flex items-center justify-between h-12 bg-gray-800 px-5 lg:px-16 text-xs sm:text-base">
                    <div className="flex flex-1 items-center">
                        <RiUserSettingsLine data-tip="Profile Setting" data-place="right" size={30} className="text-white cursor-pointer focus:outline-none" />
                        <p className="text-white ml-3">Hello {user?.nickname}</p>
                    </div>

                    {/* <p className="flex-1 text-center text-white">Online Users : {allUsers.length}</p> */}

                    <div className="flex flex-1 justify-end items-center">
                        <RiLogoutCircleRLine data-tip="Logout" data-place="left" size={30} className="text-white cursor-pointer focus:outline-none" onClick={() => {
                            removeUser();
                            history.push('/login');
                        }} />
                    </div>
                </div>

                {/* Body */}
                <div className="flex">
                    <div id="chat-list" className="w-1/4 lg:w-1/6 bg-gray-200" style={{ height: 'calc(100vh - 48px)' }}>
                        <div className="flex flex-col items-center mt-5">
                            <h3 className="mb-2 text-sm font-bold">Rooms</h3>
                            <ul className="pt-2 pb-4 text-xs w-full">
                                {rooms.map((room, index) => (
                                    <li
                                        className="text-center py-2 cursor-pointer transition hover:bg-gray-100"
                                        key={index}
                                        onClick={() => {
                                            const currentChat = {
                                                chatName: room,
                                                isChannel: true,
                                                receiverId: ''
                                            };
                                            toggleChat(currentChat);
                                        }}
                                    >{room}</li>
                                ))}
                            </ul>
                        </div>
                        <hr className="h-0.5 bg-gray-300 mx-5" />
                        <div className="flex flex-col items-center mt-5 pb-12">
                            <h3 className="mb-2 font-bold text-xs sm:text-sm">Online Users: {allUsers.length}</h3>
                            <ul className="pt-2 pb-4 text-xs w-full">
                                <li className="text-center py-2"><b>You : </b>{user?.nickname}</li>
                                {allUsers.filter(u => u.nickname !== user?.nickname).map((u, index) => (
                                    <li
                                        className="text-center py-2 cursor-pointer transition hover:bg-gray-100"
                                        key={index}
                                        onClick={() => {
                                            const currentChat = {
                                                chatName: u.nickname,
                                                isChannel: false,
                                                receiverId: u.socketId
                                            }
                                            toggleChat(currentChat);
                                        }}
                                    >{u.nickname}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="w-3/4 lg:w-5/6 relative">
                        <div className="flex justify-center items-center h-12 border-b-2">
                            <p className="font-bold">{currentChat.chatName}</p>
                        </div>
                        <div id="message-list" className="w-full" style={{ height: 'calc(100vh - 96px - 57px)' }}>
                            <div className="py-2 px-3">
                                {messagesBody}
                            </div>
                        </div>
                        <form onSubmit={sendMessage} className="flex items-center h-12 md:h-14 w-full absolute bottom-0 p-2 bg-gray-200 text-xs md:text-sm" autoComplete="off">
                            <input type="text" name="message" onInvalid={({ target }) => {
                                CustomValidationModule.onSubmit(target);
                            }} value={message} onChange={handleMessageChange} className="w-full bg-white rounded-full px-5 py-2 focus:outline-none" placeholder="Send a message..." required />
                            <button type="submit" className="px-5 py-2 transition bg-gray-800 active:bg-gray-700 text-white rounded ml-3 focus:outline-none disabled:opacity-50" disabled={!connectedRooms.includes(currentChat.chatName)}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Home;
