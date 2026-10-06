import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData, dummyChats } from "../assets/assets";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const fetchUser = async () => {
        setUser(dummyUserData)
    }
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUsersChats = async () => {
        setChats(dummyChats)
        setSelectedChat()
    }

    useEffect(() => {
        if (user) {
            fetchUsersChats();
        }
        else {
            setChats([]);
            setSelectedChat(null);
        }
    }, [user]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const value = {
        // Add any state or functions you want to provide here
        navigate,
        user,
        setUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme,
        fetchUser,
        fetchUsersChats
    };
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
export const useAppContext = () => useContext(AppContext);
