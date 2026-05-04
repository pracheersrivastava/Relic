'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './VideoPlayer.module.css';

// YouTube Player API types
declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                config: {
                    videoId: string;
                    playerVars?: Record<string, number | string>;
                    events?: {
                        onReady?: (event: { target: YTPlayer }) => void;
                        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
                        onError?: (event: { data: number }) => void;
                    };
                }
            ) => YTPlayer;
            PlayerState: {
                UNSTARTED: number;
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
                BUFFERING: number;
                CUED: number;
            };
        };
        onYouTubeIframeAPIReady?: () => void;
        __youtubeIframeAPIReadyCallbacks?: Array<() => void>;
    }
}

interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    setPlaybackRate: (rate: number) => void;
    getPlaybackRate: () => number;
    getAvailablePlaybackRates: () => number[];
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
    getOption: (module: string, option: string) => unknown;
    setOption: (module: string, option: string, value: unknown) => void;
}

interface VideoPlayerProps {
    videoUrl: string;
    lessonTitle?: string;
    nextLesson?: {
        title: string;
        duration: string;
    };
    onEnded?: () => void;
    onProgress?: (progress: number) => void;
    onStartNext?: () => void;
}

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function VideoPlayer({ videoUrl, lessonTitle, nextLesson, onEnded, onProgress, onStartNext }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const playerContainerId = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [captionsEnabled, setCaptionsEnabled] = useState(true);
    const [isYouTube, setIsYouTube] = useState(false);
    const [showEndedOverlay, setShowEndedOverlay] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const youtubeVideoId = getYouTubeVideoId(videoUrl);

    const initializePlayer = useCallback(() => {
        if (!youtubeVideoId || !window.YT) return;

        // Destroy existing player
        if (playerRef.current) {
            playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(playerContainerId.current, {
            videoId: youtubeVideoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                cc_load_policy: 1, // Enable captions
                cc_lang_pref: 'en',
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: (event) => {
                    setIsLoading(false);
                    setDuration(event.target.getDuration());
                    setVolume(event.target.getVolume());

                    // Start progress tracking
                    progressInterval.current = setInterval(() => {
                        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                            try {
                                const time = playerRef.current.getCurrentTime();
                                const dur = playerRef.current.getDuration();
                                setCurrentTime(time);
                                if (dur > 0 && onProgress) {
                                    onProgress((time / dur) * 100);
                                }
                            } catch {
                                // Player not ready yet
                            }
                        }
                    }, 500);
                },
                onStateChange: (event) => {
                    switch (event.data) {
                        case window.YT.PlayerState.PLAYING:
                            setIsPlaying(true);
                            setIsLoading(false);
                            break;
                        case window.YT.PlayerState.PAUSED:
                            setIsPlaying(false);
                            break;
                        case window.YT.PlayerState.ENDED:
                            setIsPlaying(false);
                            if (nextLesson) {
                                setShowEndedOverlay(true);
                            }
                            onEnded?.();
                            break;
                        case window.YT.PlayerState.BUFFERING:
                            setIsLoading(true);
                            break;
                    }
                },
                onError: (event) => {
                    setIsLoading(false);
                    const errorMessages: Record<number, string> = {
                        2: 'Invalid video ID',
                        5: 'HTML5 player error',
                        100: 'Video not found',
                        101: 'Video embedding not allowed',
                        150: 'Video embedding not allowed',
                    };
                    setError(errorMessages[event.data] || 'Failed to load video');
                },
            },
        });
    }, [youtubeVideoId, onEnded, onProgress]);

    // Load YouTube IFrame API
    useEffect(() => {
        if (!youtubeVideoId) {
            setIsYouTube(false);
            return;
        }

        setIsYouTube(true);
        setIsLoading(true);
        setError(null);

        const enqueueInitialize = () => {
            initializePlayer();
        };

        if (window.YT && window.YT.Player) {
            enqueueInitialize();
            return;
        }

        if (!window.__youtubeIframeAPIReadyCallbacks) {
            window.__youtubeIframeAPIReadyCallbacks = [];
        }

        window.__youtubeIframeAPIReadyCallbacks.push(enqueueInitialize);

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);

            const previousCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                window.__youtubeIframeAPIReadyCallbacks?.forEach((cb) => cb());
                window.__youtubeIframeAPIReadyCallbacks = [];
                if (typeof previousCallback === 'function') {
                    previousCallback();
                }
            };
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [youtubeVideoId, initializePlayer]);

    // Reinitialize when video changes
    useEffect(() => {
        if (youtubeVideoId && window.YT && window.YT.Player) {
            initializePlayer();
        }
    }, [youtubeVideoId, initializePlayer]);

    // Control handlers
    const togglePlay = useCallback(() => {
        if (!playerRef.current) return;

        if (isPlaying) {
            if (typeof playerRef.current.pauseVideo === 'function') {
                playerRef.current.pauseVideo();
            }
        } else {
            if (typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
            }
        }
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !playerRef.current || !duration) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;

        if (typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(newTime, true);
        }
        setCurrentTime(newTime);
    }, [duration]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!playerRef.current) return;

        const newVolume = Number(e.target.value);
        playerRef.current.setVolume(newVolume);
        setVolume(newVolume);

        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        }
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        if (!playerRef.current) return;

        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume || 50);
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    }, [isMuted, volume]);

    const handleSpeedChange = useCallback((rate: number) => {
        if (!playerRef.current) return;

        playerRef.current.setPlaybackRate(rate);
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    const toggleCaptions = useCallback(() => {
        if (!playerRef.current) return;

        try {
            const newState = !captionsEnabled;
            // YouTube API - use fontSize to show/hide captions
            // fontSize: 0 = off, -1 = default size
            if (typeof playerRef.current.setOption === 'function') {
                playerRef.current.setOption('captions', 'fontSize', newState ? -1 : 0);
            }
            setCaptionsEnabled(newState);
        } catch {
            // Captions might not be available
            setCaptionsEnabled(!captionsEnabled);
        }
    }, [captionsEnabled]);

    // Show/hide controls
    const handleMouseMove = useCallback(() => {
        setShowControls(true);

        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }

        hideControlsTimeout.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
                setShowSpeedMenu(false);
            }
        }, 3000);
    }, [isPlaying]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!playerRef.current) return;
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (typeof playerRef.current.seekTo === 'function') {
                        playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
                    }
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (typeof playerRef.current.seekTo === 'function') {
                        playerRef.current.seekTo(Math.min(duration, currentTime + 10), true);
                    }
                    break;
                case 'arrowup':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: String(Math.min(100, volume + 10)) } } as React.ChangeEvent<HTMLInputElement>);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleVolumeChange({ target: { value: String(Math.max(0, volume - 10)) } } as React.ChangeEvent<HTMLInputElement>);
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'escape':
                    if (isFullscreen) {
                        document.exitFullscreen();
                    }
                    break;
            }
        };

        if (containerRef.current) {
            containerRef.current.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [togglePlay, currentTime, duration, volume, isFullscreen, toggleFullscreen, toggleMute, toggleCaptions, handleVolumeChange]);

    // Countdown timer for auto-advance to next lesson
    useEffect(() => {
        if (showEndedOverlay && nextLesson) {
            setCountdown(5);
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        // Auto-advance to next lesson
                        clearInterval(countdownRef.current!);
                        setShowEndedOverlay(false);
                        onStartNext?.();
                        return 5;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [showEndedOverlay, nextLesson, onStartNext]);

    // For non-YouTube videos, show error
    if (!isYouTube) {
        return (
            <div className={styles.playerContainer}>
                <div className={styles.errorOverlay}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <p>Only YouTube videos are currently supported</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`${styles.playerContainer} ${isFullscreen ? styles.fullscreen : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            tabIndex={0}
        >
            {/* YouTube Player Container */}
            <div className={styles.videoWrapper}>
                <div id={playerContainerId.current} className={styles.youtubePlayer} />
            </div>

            {/* Click to play overlay */}
            <div className={styles.clickOverlay} onClick={togglePlay} />

            {/* Loading overlay */}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div className={styles.errorOverlay}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <p>{error}</p>
                </div>
            )}

            {/* Lesson title */}
            {lessonTitle && showControls && (
                <div className={styles.titleOverlay}>
                    <h3>{lessonTitle}</h3>
                </div>
            )}

            {/* Next Lesson Overlay - shown when video ends */}
            {showEndedOverlay && nextLesson && (
                <div className={styles.endedOverlay}>
                    <div className={styles.nextLessonCard}>
                        <div className={styles.nextLessonHeader}>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                            </svg>
                            <span>Video • {nextLesson.duration}</span>
                            <span className={styles.countdownBadge}>{countdown}s</span>
                        </div>
                        <h4 className={styles.nextLessonTitle}>{nextLesson.title}</h4>
                        <div className={styles.nextLessonActions}>
                            <button
                                className={styles.startNextButton}
                                onClick={() => {
                                    if (countdownRef.current) clearInterval(countdownRef.current);
                                    setShowEndedOverlay(false);
                                    onStartNext?.();
                                }}
                            >
                                Start Now
                            </button>
                            <button
                                className={styles.pauseButton}
                                onClick={() => {
                                    if (countdownRef.current) clearInterval(countdownRef.current);
                                    setShowEndedOverlay(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Play/Pause center button */}
            {!isPlaying && !isLoading && !error && !showEndedOverlay && (
                <button className={styles.bigPlayButton} onClick={togglePlay}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            )}

            {/* Controls bar */}
            <div className={`${styles.controlsBar} ${showControls ? styles.visible : ''}`}>
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className={styles.progressBar}
                    onClick={handleSeek}
                >
                    <div
                        className={styles.progressFilled}
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    <div
                        className={styles.progressHandle}
                        style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                </div>

                <div className={styles.controlsRow}>
                    {/* Left controls */}
                    <div className={styles.leftControls}>
                        <button className={styles.controlButton} onClick={togglePlay}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        {/* Volume */}
                        <div className={styles.volumeControl}>
                            <button className={styles.controlButton} onClick={toggleMute}>
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : volume < 50 ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className={styles.volumeSlider}
                            />
                        </div>

                        {/* Time */}
                        <span className={styles.timeDisplay}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right controls */}
                    <div className={styles.rightControls}>

                        {/* Speed */}
                        <div className={styles.speedControl}>
                            <button
                                className={styles.controlButton}
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            >
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div className={styles.speedMenu}>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            className={`${styles.speedOption} ${playbackRate === rate ? styles.active : ''}`}
                                            onClick={() => handleSpeedChange(rate)}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button className={styles.controlButton} onClick={toggleFullscreen}>
                            {isFullscreen ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
