import {useState, useEffect, useCallback} from 'react';
import apiClient from '../api-client/api';
import {IUser} from "./types/IUser";

const useUser = (): {
    user: IUser,
    setUser: (value: (((prevState: IUser) => IUser) | IUser)) => void,
    loading: boolean,
    error: any
    refreshUser: ()=>{}
} => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            const response = await apiClient.get('/auth/me');
            setUser(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch user data');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = async () => {
        setLoading(true);
        await fetchUser();
    };

    return { user, setUser, loading, error, refreshUser };
};

export default useUser;
