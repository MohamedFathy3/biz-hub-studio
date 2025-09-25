import { useState, useRef, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import FriendComponent from "@/components/feed/frindereaquest";

const reels = [
  {
    id: 1,
    video: "https://www.youtube.com/embed/fJSFus0pxZI",
    thumbnail: "https://img.youtube.com/vi/fJSFus0pxZI/maxresdefault.jpg",
    user: {
      name: "Sarah Johnson",
      avatar: "https://imgs.search.brave.com/BIXYCDPNpywnnCvcr1QFel6FCCB9dmjpYlZh8WNIHpY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly8zcmFi/YXBwLmNvbS9hcHBz/dG9yZS93cC1jb250/ZW50L3VwbG9hZHMv/MjAyMC8wOS9jYXQ1/LTE1LmpwZw"
    },
    caption: "Exploring the city lights! 🌃",
    likes: 1245,
    comments: 67,
    shares: 32
  },
  {
    id: 2,
    video: "https://youtu.be/gKB1Wc7tsW8?si=oOo0sl3IGjpxYNuv",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    user: {
      name: "Nature Lover",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
    },
    caption: "Spring is here! 🌸",
    likes: 876,
    comments: 43,
    shares: 21
  },
  {
    id: 3,
    video: "https://youtu.be/gKB1Wc7tsW8?si=oOo0sl3IGjpxYNuv",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-about-fashion-40906-large.mp4",
    user: {
      name: "Fashion Tips",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
    },
    caption: "Summer fashion!",
    likes: 2109,
    comments: 128,
    shares: 76
  },
  {
    id: 4,
    video: "https://youtu.be/B-x7eeYtFIA?si=VECh5KxHXH-Lfqmh",
    thumbnail: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-smartphone-displaying-social-media-40659-large.mp4",
    user: {
      name: "Tech Reviews",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80"
    },
    caption: "New phone review! 📱",
    likes: 3456,
    comments: 231,
    shares: 98
  },
];

const ReelsPage = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [progress, setProgress] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  // تحديد إذا كان الفيديو من YouTube
  useEffect(() => {
    setIsYouTube(reels[currentReelIndex].video.includes('youtube'));
  }, [currentReelIndex]);

  // تشغيل الفيديو عند تغيير المؤشر
  useEffect(() => {
    if (videoRef.current && !isYouTube) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("تشغيل الفيديو فشل:", error);
        });
      }
      
      setIsPlaying(true);
      setProgress(0);
    }
  }, [currentReelIndex, isYouTube]);

  // التعامل مع التمرير بالسحب (لتجربة شبيهة بتيك توك)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isSwiping = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      isSwiping = true;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      
      const currentY = e.touches[0].clientY;
      const diffY = startY - currentY;

      // إذا كانت الحركة كبيرة بما يكفي، انتقل إلى الفيديو التالي أو السابق
      if (Math.abs(diffY) > 100) {
        if (diffY > 0) {
          // سحب لأعلى - الفيديو التالي
          setCurrentReelIndex(prev => Math.min(prev + 1, reels.length - 1));
        } else {
          // سحب لأسفل - الفيديو السابق
          setCurrentReelIndex(prev => Math.max(prev - 1, 0));
        }
        isSwiping = false;
        isScrolling.current = true;
        
        // منع التمرير المتعدد
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    };

    const handleWheel = (e) => {
      if (isScrolling.current) return;
      
      e.preventDefault();
      if (e.deltaY > 50) {
        // تمرير لأسفل - الفيديو التالي
        setCurrentReelIndex(prev => Math.min(prev + 1, reels.length - 1));
        isScrolling.current = true;
        
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      } else if (e.deltaY < -50) {
        // تمرير لأعلى - الفيديو السابق
        setCurrentReelIndex(prev => Math.max(prev - 1, 0));
        isScrolling.current = true;
        
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const togglePlay = () => {
    if (!isYouTube && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
    // للفيديوهات من YouTube، لا يمكن التحكم بها برمجيًا بسبب قيود الأمان
  };

  const toggleLike = (reelId) => {
    setLikedReels(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  return (
    <MainLayout>
      <div className="h-screen m-6 w-50 rounded-sm flex overflow-hidden bg-black">
        <div ref={containerRef} className="flex-1  rounded-sm relative overflow-hidden">
          {/* فيديو الـ Reel الحالي */}
          <div className="h-full w-full flex items-center  rounded-sm justify-center">
            {isYouTube ? (
              <iframe
                src={`${reels[currentReelIndex].video}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                className="h-full w-full object-cover"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            ) : (
              <video
                ref={videoRef}
                src={reels[currentReelIndex].video}
                className="h-full w-full object-cover"
                muted
                autoPlay
                loop
                playsInline
                onClick={togglePlay}
              />
            )}
            
            {/* شريط التقدم (لا يعمل مع YouTube) */}
            {!isYouTube && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600 z-10">
                <div 
                  className="h-full bg-red-600 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* معلومات المستخدم والتسمية */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pb-20">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={reels[currentReelIndex].user.avatar}
                  className="w-10 h-10 rounded-full border-2 border-white"
                  alt={reels[currentReelIndex].user.name}
                />
                <span className="text-white font-semibold">{reels[currentReelIndex].user.name}</span>
                <button className="ml-2 px-3 py-1 bg-white/20 text-white text-xs rounded-full">
                  متابعة
                </button>
              </div>
              <p className="text-white text-sm mb-2">{reels[currentReelIndex].caption}</p>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white text-xs">أصوات</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-xs">موسيقى الأصلية</span>
                </div>
              </div>
            </div>

            {/* الأزرار الجانبية (إعجاب، تعليق، مشاركة) */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 text-white">
              <div className="text-center">
                <button 
                  className="bg-white/10 p-2 rounded-full flex items-center justify-center w-12 h-12"
                  onClick={() => toggleLike(reels[currentReelIndex].id)}
                >
                  {likedReels[reels[currentReelIndex].id] ? (
                    <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
                <p className="text-xs mt-1 font-semibold">
                  {formatCount(likedReels[reels[currentReelIndex].id] ? reels[currentReelIndex].likes + 1 : reels[currentReelIndex].likes)}
                </p>
              </div>
              
              <div className="text-center">
                <button className="bg-white/10 p-2 rounded-full flex items-center justify-center w-12 h-12">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <p className="text-xs mt-1 font-semibold">{formatCount(reels[currentReelIndex].comments)}</p>
              </div>
              
              <div className="text-center">
                <button className="bg-white/10 p-2 rounded-full flex items-center justify-center w-12 h-12">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <p className="text-xs mt-1 font-semibold">{formatCount(reels[currentReelIndex].shares)}</p>
              </div>
              
              <div className="text-center">
                <button className="bg-white/10 p-2 rounded-full flex items-center justify-center w-12 h-12">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </button>
              </div>
              
              {!isYouTube && (
                <button
                  className="bg-white/10 p-2 rounded-full flex items-center justify-center w-12 h-12"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* مؤشر السحب */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="w-40 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* الشريط الجانبي للأصدقاء */}
        
      </div>
    </MainLayout>
  );
};

export default ReelsPage;