import React, { createContext, useState, useRef, useContext, useEffect } from 'react';

interface AudioContextType {
    audioUrl: string | null;
    setAudioUrl: (url: string | null) => void;
    playAudio: (url: string, itemTitle: string, feedTitle: string, imageUrl: string, postId: string, startPosition: number) => void;
    audioRef: React.RefObject<HTMLAudioElement>;
    itemTitle: string | null;
    feedTitle: string | null;
    imageUrl: string | null;
    postId: string | null;
    audioPosition: number;
    stopAudio: () => void;
    setAudioPosition: (position: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{children: any}> = ({ children }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [itemTitle, setItemTitle] = useState<string | null>(null);
    const [feedTitle, setFeedTitle] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [postId, setPostId] = useState<string | null>(null);
    const [audioPosition, setAudioPosition] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const playAudio = (url: string, itemTitle: string, feedTitle: string, imageUrl: string, postId: string, startPosition: number) => {
        setAudioUrl(url);
        setItemTitle(itemTitle);
        setFeedTitle(feedTitle);
        setImageUrl(imageUrl);
        setPostId(postId);
        setAudioPosition(startPosition);
    };

    const stopAudio = () => {
        setAudioUrl(null);
        setItemTitle(null);
        setFeedTitle(null);
        setImageUrl(null);
        setPostId(null);
        setAudioPosition(0);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    };

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            audioRef.current.currentTime = audioPosition;
            audioRef.current.play();
        }
    }, [audioUrl, audioPosition]);

    return (
        <AudioContext.Provider value={{ audioUrl, setAudioUrl, playAudio, audioRef, itemTitle, feedTitle, imageUrl, postId, audioPosition, stopAudio, setAudioPosition }}>
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
