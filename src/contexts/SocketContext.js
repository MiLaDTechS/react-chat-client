import React, { useContext } from 'react'
import { io } from 'socket.io-client'

const socket = io(process.env.REACT_APP_SOCKET_URL, { autoConnect: false });
const SocketContext = React.createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export default SocketContext