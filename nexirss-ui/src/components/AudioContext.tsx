import React, { createContext, useState, useRef, useContext, useEffect } from 'react';

interface AudioContextType {
    audioUrl: string | null;
    setAudioUrl: (url: string | null) => void;
    playAudio: (url: string, itemTitle: string, feedTitle: string, imageUrl: string, postId: string) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
    itemTitle: string | null;
    feedTitle: string | null;
    imageUrl: string | null;
    postId: string | null;
    stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{children: any}> = ({ children }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [itemTitle, setItemTitle] = useState<string | null>(null);
    const [feedTitle, setFeedTitle] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [postId, setPostId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playAudio = (url: string, itemTitle: string, feedTitle: string, imageUrl: string, postId: string) => {
        setAudioUrl(url);
        setItemTitle(itemTitle);
        setFeedTitle(feedTitle);
        setImageUrl(imageUrl);
        setPostId(postId);
    };

    const stopAudio = () => {
        setAudioUrl(null);
        setItemTitle(null);
        setFeedTitle(null);
        setImageUrl(null);
        setPostId(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    };

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            audioRef.current.play();
        }
    }, [audioUrl]);

    return (
        <AudioContext.Provider value={{ audioUrl, setAudioUrl, playAudio, audioRef, itemTitle, feedTitle, imageUrl, postId, stopAudio }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
