import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItem, ListItemText, IconButton, Avatar, Box } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PodcastIcon from '@mui/icons-material/Mic';

interface AudioInfo {
    length?: number;
    type: string;
    url: string;
}

interface FeedItem {
    _id: string;
    title: string;
    link: string;
    pubDate: string;
    content: string;
    audioInfo?: AudioInfo;
    feed?: {image?: string}
}

interface FeedItemPreviewProps {
    item: FeedItem;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor((seconds % 60)).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const bytesToSeconds = (bytes: number, bitrate = 128000) => {
    return bytes / (bitrate / 8);
};

const placeholderImage = 'https://via.placeholder.com/150';

const FeedItemPreview: React.FC<FeedItemPreviewProps> = ({ item }) => {
    const audioPosition = localStorage.getItem(`audioPosition-${item._id}`);
    const audioLength = item.audioInfo ? bytesToSeconds(Number(item.audioInfo.length)) : 0;

    return (
        <ListItem component={RouterLink} to={`/items/${item._id}`} button>
            <Avatar
                variant="square"
                src={item?.feed?.image || placeholderImage}
                alt={item.title}
                sx={{ width: 56, height: 56, marginRight: 2 }}
            />
            <ListItemText
                primary={item.title}
                secondary={
                    <>
                        {new Date(item.pubDate).toLocaleString()}
                        {item.audioInfo && (
                            <>
                                <br />
                                <PodcastIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {formatTime(audioLength)} | Listened: {audioPosition ? formatTime(Number(audioPosition)) : '0:00:00'}
                            </>
                        )}
                    </>
                }
            />
            <IconButton
                edge="end"
                aria-label="open-in-new"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(item.link, '_blank');
                }}
            >
                <OpenInNewIcon />
            </IconButton>
        </ListItem>
    );
};

export default FeedItemPreview;
