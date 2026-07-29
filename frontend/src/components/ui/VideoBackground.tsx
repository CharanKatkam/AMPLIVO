'use client';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VideoBackgroundProps {
  src: string;
  poster: string;
  className?: string;
}

export function VideoBackground({ src, poster, className }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(video.parentElement ?? video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => setIsLoaded(true);
    const onError = () => setHasError(true);

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    if (video.readyState >= 3) setIsLoaded(true);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
    };
  }, [isVisible]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#1a0540] z-[1]" />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
