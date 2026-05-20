import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Search, LogIn, MessageSquare, 
  Share2, Flame, Trophy, Users, BookOpen,
  ArrowBigUp, ArrowBigDown, X, Clock, TrendingUp, Send, Loader2, Image as ImageIcon,
  AlertCircle, CheckCircle, Heart, Twitter, Github, Mail, ChevronRight
} from 'lucide-react';

export default function CommunityPage() {
  const navigate = useNavigate();
  
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ id: "", name: "", avatar: "", token: "" });

  // --- COMMUNITY STATE ---
  const [activeEra, setActiveEra] = useState('All Eras');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('hot'); // 'hot', 'new', 'top'
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null); 
  
  // --- POST CREATION & INTERACTION STATE ---
  const [isComposing, setIsComposing] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', era: 'e/General' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState(""); 

  const eras = ['All Eras', 'e/Jurassic', 'e/EarthFormation', 'e/AncientRome', 'e/Theories'];

  // --- TOAST NOTIFICATION HELPER ---
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- INITIALIZE AUTH & FETCH POSTS ---
  useEffect(() => {
    let currentUserId = null;
    try {
      const userInfoString = localStorage.getItem("userInfo");
      const standaloneToken = localStorage.getItem("token"); 

      if (userInfoString) {
        const parsedData = JSON.parse(userInfoString);
        const userData = parsedData.user || parsedData;
        const userToken = parsedData.token || standaloneToken || "";

        if (userData) {
          setIsLoggedIn(true);
          const userName = userData.name || userData.username || "Scholar";
          currentUserId = userData._id || userData.id;
          
          setUser({
            id: currentUserId,
            name: userName,
            avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.avatarSeed || userName}`,
            token: userToken
          });
        }
      }
    } catch (error) {
      console.error("Error reading auth state from local storage:", error);
    }

    fetchPosts(currentUserId);
  }, []);

  const fetchPosts = async (currentUserId) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/posts'); 
      if (response.ok) {
        const data = await response.json();
        
        // Map over posts to determine if the current user has already voted
        const processedPosts = data.map(post => {
          let userVote = 0;
          if (currentUserId) {
            if (post.upvotes?.includes(currentUserId)) userVote = 1;
            if (post.downvotes?.includes(currentUserId)) userVote = -1;
          }
          return { ...post, userVote };
        });
        
        setPosts(processedPosts);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleVote = async (e, postId, direction) => {
    e.stopPropagation(); 
    
    if (!isLoggedIn) {
      showToast("You must be logged in to endorse or dispute scrolls.", "error");
      return;
    }

    // Optimistic UI Update
    setPosts(posts.map(post => {
      if (post._id === postId || post.id === postId) {
        let newUserVote = post.userVote === direction ? 0 : direction;
        let newScore = post.score;
        
        // Revert old vote impact
        if (post.userVote === 1) newScore -= 1;
        if (post.userVote === -1) newScore += 1;
        
        // Apply new vote impact
        if (newUserVote === 1) newScore += 1;
        if (newUserVote === -1) newScore -= 1;

        return { ...post, score: newScore, userVote: newUserVote };
      }
      return post;
    }));

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include', 
        body: JSON.stringify({ direction }) 
      });

      if (response.ok) {
        const data = await response.json();
        // Sync arrays back from server just to be perfectly accurate
        setPosts(prevPosts => prevPosts.map(p => 
          (p._id === postId || p.id === postId) 
            ? { ...p, score: data.score, upvotes: data.upvotes, downvotes: data.downvotes } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error voting:", error);
      showToast("The archives rejected your endorsement. Try again.", "error");
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include',
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const updatedComments = await response.json();
        
        // Update the comments array for the specific post
        setPosts(posts.map(post => 
          (post._id === postId || post.id === postId) 
            ? { ...post, comments: updatedComments } 
            : post
        ));
        
        setCommentText(""); // Clear the input field
        showToast("Your wisdom has been recorded.", "success");
      } else {
        showToast("Failed to add response. Try again.", "error");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      showToast("Could not connect to the archives.", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const closeComposer = () => {
    setIsComposing(false);
    clearImage();
    setNewPost({ title: '', content: '', era: 'e/General' });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    formData.append('era', newPost.era !== 'All Eras' ? newPost.era : 'e/General');
    formData.append('authorName', user.name);
    formData.append('authorAvatar', user.avatar);
    
    if (imageFile) {
      formData.append('image', imageFile); 
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}` 
        },
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts([{ ...createdPost, userVote: 1 }, ...posts]); // Automatically set initial userVote to 1 for own post
        closeComposer();
        showToast("Your scroll has been added to the archives.", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to publish scroll. The ink has spilled.", "error");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Could not connect to the archives. Please try again later.", "error");
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // --- FILTERING & SORTING ---
  let displayedPosts = posts.filter(post => {
    const matchesEra = activeEra === 'All Eras' || post.era === activeEra;
    const searchString = `${post.title || ''} ${post.content || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesEra && matchesSearch;
  });

  if (sortBy === 'hot') {
    displayedPosts.sort((a, b) => ((b.score || 0) + (b.comments?.length || 0) * 5) - ((a.score || 0) + (a.comments?.length || 0) * 5));
  } else if (sortBy === 'new') {
    displayedPosts.sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
  } else if (sortBy === 'top') {
    displayedPosts.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative">
      
      {/* ---------------- GLOBAL STYLES ---------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Lato:wght@400;700&display=swap');
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Lato', sans-serif; }
        .ancient-wall-bg {
          background-color: #120d08;
          background-image: 
            radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.1), rgba(0, 0, 0, 0.95)),
            url("https://www.transparenttextures.com/patterns/stucco.png");
          background-blend-mode: screen, overlay;
          background-attachment: fixed;
        }
      `}</style>

      {/* Background Layers */}
      <div className="fixed inset-0 ancient-wall-bg z-[-2]"></div>

      {/* ---------------- TOAST NOTIFICATIONS ---------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
              toast.type === 'error' 
                ? 'bg-red-950/90 border-red-500/50 text-red-200' 
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span className="text-sm font-bold tracking-wider">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="sticky top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/30 shadow-2xl rounded-2xl px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="group-hover:rotate-6 transition-transform flex items-center justify-center">
               <img src="/assets/scroll.png" alt="Scroll Icon" className="w-9 h-9 object-contain rounded-lg" />
            </div>
            <img 
               src="/assets/dark_brown.png" 
               alt="Historia Banner" 
               className="h-6 md:h-8 object-contain drop-shadow-md"
               style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg)" }}
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => navigate("/explore")} icon={<Compass size={16} />} label="Explore" isActive={false} />
            <NavLink onClick={() => navigate("/community")} icon={<Users size={16} />} label="Community" isActive={true} />
            
            <div className="w-px h-6 bg-amber-900/50 mx-2"></div>
            
            {isLoggedIn ? (
              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 p-1 pr-4 bg-amber-950/40 border border-amber-500/30 rounded-full hover:bg-amber-900/50 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden group-hover:border-amber-400 transition-colors bg-amber-900">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-amber-100 max-w-[100px] truncate">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 px-5 py-2 rounded-lg font-medium text-sm hover:brightness-110 shadow-lg border border-amber-600/30 transition-all active:scale-95"
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="max-w-7xl mx-auto px-6 pt-8 pb-24 relative z-10">
        
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-amber-900/30 pb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2 text-amber-500">
              <Users size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">The Agora</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-amber-100 drop-shadow-xl">
              Scholars' Forum
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
              <input 
                type="text" 
                placeholder="Search the archives..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a130e]/80 border border-amber-900/50 rounded-full py-3 pl-12 pr-4 text-amber-50 focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
              />
            </div>
            <button 
              onClick={() => {
                if(!isLoggedIn) {
                  showToast("You must be logged in to pen a scroll.", "error");
                  setTimeout(() => navigate("/login"), 1500);
                  return;
                }
                setIsComposing(true);
              }}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded-full shadow-lg transition-colors border border-amber-400/50 flex items-center justify-center gap-2"
            >
              <Send size={16} /> Pen a Scroll
            </button>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Feed */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Era Tabs & Sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#150f0a]/80 p-4 rounded-2xl border border-amber-900/30">
              
              <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 hide-scrollbar w-full sm:w-auto">
                {eras.map((era) => (
                  <button
                    key={era}
                    onClick={() => setActiveEra(era)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all whitespace-nowrap border ${
                      activeEra === era 
                        ? 'bg-amber-900/60 text-amber-400 border-amber-500/50' 
                        : 'bg-black/30 text-amber-200/50 border-transparent hover:bg-black/50 hover:text-amber-200'
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-amber-900/20">
                {[
                  { id: 'hot', icon: Flame, label: 'Hot' },
                  { id: 'new', icon: Clock, label: 'New' },
                  { id: 'top', icon: TrendingUp, label: 'Top' }
                ].map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      sortBy === sort.id ? 'bg-amber-800/80 text-amber-100' : 'text-amber-500/50 hover:text-amber-400'
                    }`}
                  >
                    <sort.icon size={14} /> {sort.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Stream */}
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : displayedPosts.length > 0 ? (
                displayedPosts.map((post, index) => {
                  const postId = post._id || post.id || index;
                  let postImage = post.imageUrl || post.image; 
                  if (postImage && postImage.startsWith('/uploads')) {
                    postImage = `http://localhost:5000${postImage}`;
                  }

                  return (
                    <motion.div
                      key={postId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#1a130e]/80 backdrop-blur-md border border-amber-900/40 rounded-2xl hover:border-amber-600/40 transition-all shadow-xl group flex overflow-hidden cursor-pointer"
                      onClick={() => {
                        setExpandedPostId(expandedPostId === postId ? null : postId);
                        setCommentText(""); // Reset text when changing panels
                      }}
                    >
                      {/* Voting Column */}
                      <div className="bg-black/40 w-14 flex flex-col items-center py-4 gap-2 border-r border-amber-900/20">
                        <button 
                          onClick={(e) => handleVote(e, postId, 1)}
                          className={`hover:bg-amber-900/40 p-1 rounded transition-colors ${post.userVote === 1 ? 'text-amber-500' : 'text-amber-700'}`}
                        >
                          <ArrowBigUp size={24} className={post.userVote === 1 ? 'fill-current' : ''} />
                        </button>
                        <span className={`text-sm font-bold ${post.userVote === 1 ? 'text-amber-500' : post.userVote === -1 ? 'text-blue-400' : 'text-amber-100'}`}>
                          {post.score || 0}
                        </span>
                        <button 
                          onClick={(e) => handleVote(e, postId, -1)}
                          className={`hover:bg-blue-900/40 p-1 rounded transition-colors ${post.userVote === -1 ? 'text-blue-400' : 'text-amber-700'}`}
                        >
                          <ArrowBigDown size={24} className={post.userVote === -1 ? 'fill-current' : ''} />
                        </button>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-2 mb-2 text-xs text-amber-200/50">
                          <span className="font-bold text-amber-500 hover:underline">{post.era || 'e/General'}</span>
                          <span>•</span>
                          <span>Posted by</span>
                          
                          {/* UPDATED: Navigates to user profile on click */}
                          <div 
                            className="flex items-center gap-1 cursor-pointer group/author"
                            onClick={(e) => {
                              e.stopPropagation();
                              const targetId = post.author?._id || post.author;
                              if (targetId) navigate(`/profile/${targetId}`);
                            }}
                          >
                            {post.authorAvatar && (
                              <img 
                                src={post.authorAvatar} 
                                alt={post.authorName} 
                                className="w-4 h-4 rounded-full bg-black/50 group-hover/author:ring-1 ring-amber-400 transition-all" 
                              />
                            )}
                            <span className="text-amber-200 group-hover/author:underline group-hover/author:text-amber-400 transition-colors">
                              {post.author?.username || post.authorName || 'Anonymous'}
                            </span>
                          </div>

                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt || post.timestamp)}</span>
                        </div>

                        <h3 className="text-xl font-heading font-bold text-amber-50 mb-2 group-hover:text-amber-300 transition-colors">
                          {post.title}
                        </h3>
                        <p className={`text-amber-200/70 text-sm leading-relaxed ${expandedPostId === postId ? '' : 'line-clamp-3'}`}>
                          {post.content}
                        </p>

                        {/* Image Preview */}
                        {postImage && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-amber-900/20 bg-black/40">
                            <img src={postImage} alt="Post attachment" className="w-full max-h-96 object-contain" />
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 text-xs font-bold text-amber-600">
                          <button className="flex items-center gap-1.5 hover:bg-amber-900/30 px-2 py-1.5 rounded transition-colors">
                            <MessageSquare size={16} /> {post.comments?.length || 0} Comments
                          </button>
                          <button className="flex items-center gap-1.5 hover:bg-amber-900/30 px-2 py-1.5 rounded transition-colors" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); showToast("Link copied to clipboard", "success"); }}>
                            <Share2 size={16} /> Share
                          </button>
                        </div>

                        {/* Expanded Comments Section */}
                        {expandedPostId === postId && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-amber-900/20"
                          >
                            <h4 className="text-sm font-bold text-amber-500 mb-4 uppercase tracking-wider">Responses</h4>
                            <div className="space-y-4">
                              {post.comments?.length > 0 ? post.comments.map((comment, i) => (
                                <div key={comment._id || i} className="bg-black/30 p-4 rounded-lg border border-amber-900/10">
                                  <div className="flex items-center gap-2 mb-2 text-xs text-amber-200/50">
                                    
                                    {/* UPDATED: Navigates to user profile on click */}
                                    <span 
                                      className="font-bold text-amber-200 cursor-pointer hover:underline hover:text-amber-400 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const targetId = comment.author?._id || comment.author;
                                        if (targetId) navigate(`/profile/${targetId}`);
                                      }}
                                    >
                                      {comment.author?.username || comment.authorName}
                                    </span>

                                    <span>•</span>
                                    <span>{formatTimeAgo(comment.createdAt)}</span>
                                  </div>
                                  <p className="text-sm text-amber-100/80">{comment.text}</p>
                                </div>
                              )) : (
                                <p className="text-sm text-amber-700 italic">No responses yet. Be the first to share your wisdom.</p>
                              )}
                              
                              {isLoggedIn ? (
                                <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                                  <input 
                                    type="text" 
                                    placeholder="Add to the discussion..." 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(postId)}
                                    className="flex-1 bg-black/50 border border-amber-900/30 rounded-lg px-4 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500/50"
                                  />
                                  <button 
                                    onClick={() => handleAddComment(postId)}
                                    className="bg-amber-800 hover:bg-amber-700 text-amber-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-4 text-xs text-amber-500/70 border border-amber-900/30 bg-amber-950/20 p-3 rounded-lg text-center">
                                  Please <span className="underline cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>log in</span> to leave a response.
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 border border-amber-900/20 border-dashed rounded-2xl bg-black/20">
                  <BookOpen className="w-16 h-16 text-amber-900/40 mx-auto mb-4" />
                  <p className="text-amber-200/40 font-heading tracking-widest text-lg">No scrolls found in this era.</p>
                  <button 
                    onClick={() => {
                       if(!isLoggedIn) {
                         showToast("You must be logged in to pen a scroll.", "error");
                         setTimeout(() => navigate("/login"), 1500);
                         return;
                       }
                       setIsComposing(true);
                    }} 
                    className="mt-4 text-amber-500 hover:text-amber-400 font-bold text-sm underline underline-offset-4"
                  >
                    Be the first to pen one
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets */}
          <div className="lg:col-span-1 space-y-6 hidden lg:block">
            
            <div className="bg-[#150f0a]/90 backdrop-blur-xl border border-amber-900/40 rounded-xl p-5 shadow-2xl">
              <h3 className="font-heading font-bold text-amber-100 mb-2">About The Agora</h3>
              <p className="text-xs text-amber-200/60 leading-relaxed mb-4">
                The central hub for all time-traveling scholars. Share your discoveries, debate historical theories, and earn Knowledge Points (KP).
              </p>
              
              <button 
                onClick={() => {
                  if(!isLoggedIn) {
                    showToast("You must be logged in to pen a scroll.", "error");
                    setTimeout(() => navigate("/login"), 1500);
                    return;
                  }
                  setIsComposing(true);
                }}
                className="w-full mt-4 py-2 bg-amber-100 text-amber-950 hover:bg-amber-200 rounded-lg text-sm font-bold transition-colors"
              >
                Create Post
              </button>
            </div>

            <div className="bg-[#150f0a]/90 backdrop-blur-xl border border-amber-900/40 rounded-xl p-5 shadow-2xl text-xs text-amber-200/50">
              <h3 className="font-bold text-amber-100 mb-3 text-sm">Laws of Time</h3>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Respect the timeline (No paradoxes).</li>
                <li>Cite your historical sources.</li>
                <li>Be civil to fellow scholars.</li>
                <li>No low-effort anachronisms.</li>
              </ol>
            </div>

          </div>
        </div>
      </main>

      {/* UPDATED VISUAL FOOTER */}
      <footer className="bg-gradient-to-b from-[#120c08] to-black text-amber-200/60 py-16 border-t border-amber-900/50 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-4 space-y-6">
              <div className="flex items-center gap-3 text-amber-100 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <img src="/assets/scroll.png" alt="Scroll Icon" className="w-10 h-10 object-contain opacity-90 rounded-lg group-hover:rotate-6 transition-transform" />
                <span className="font-heading font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">HISTORIA</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Preserving the past for the future. An open-source initiative blending WebGL and AI to digitize human history into immersive, interactive experiences.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <SocialIcon icon={<Twitter size={18} />} />
                <SocialIcon icon={<Github size={18} />} />
                <SocialIcon icon={<Mail size={18} />} />
              </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2">
              <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <FooterLink label="Explore Eras" />
                 <FooterLink label="Community Forum" />
                 <FooterLink label="Artifact Store" />
              </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 md:col-span-2">
              <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">Resources</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <FooterLink label="Credits & Team" />
                 <FooterLink label="My Profile" />
                 <li className="hover:text-amber-200 cursor-default transition-colors flex items-center gap-2 group opacity-60">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-700 transition-colors"></span>
                   Educators API <span className="text-[9px] bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded ml-1 border border-amber-700/50">SOON</span>
                 </li>
              </ul>
          </div>

          {/* Newsletter / Keep In Touch */}
          <div className="col-span-1 md:col-span-4 bg-[#1a120b]/50 p-6 rounded-2xl border border-amber-900/30 shadow-inner">
              <h4 className="text-amber-400 font-bold mb-3 uppercase text-xs tracking-widest">Join the Expedition</h4>
              <p className="text-xs mb-4 text-amber-200/50 leading-relaxed">Get monthly dispatches on new historical eras, community events, and 3D artifact drops directly to your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your parchment..." 
                  className="bg-[#0f0a06] border border-amber-900/50 rounded-lg px-4 py-2 text-sm w-full text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button className="bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center border border-amber-500/30">
                  <ChevronRight size={18} />
                </button>
              </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-amber-900/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p className="flex items-center gap-1 text-amber-200/40">
            © {new Date().getFullYear()} Historia Project. Built with <Heart size={12} className="text-red-900 mx-1 fill-red-900" /> for history.
          </p>
          <div className="flex gap-6 text-amber-200/40">
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Privacy Doctrine</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Cookie Manifesto</span>
          </div>
        </div>
      </footer>

      {/* ---------------- POST CREATION MODAL ---------------- */}
      <AnimatePresence>
        {isComposing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeComposer}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a120b] border border-amber-700/50 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              <div className="flex justify-between items-center p-4 border-b border-amber-900/50 bg-black/20">
                <h3 className="font-heading font-bold text-xl text-amber-100">Pen a Scroll</h3>
                <button onClick={closeComposer} className="text-amber-500/50 hover:text-amber-400 transition-colors p-1">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="p-6 space-y-5">
                <div>
                  <select 
                    value={newPost.era}
                    onChange={(e) => setNewPost({...newPost, era: e.target.value})}
                    className="w-full sm:w-auto bg-black/40 border border-amber-900/50 rounded-lg px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-500/50 text-sm"
                  >
                    <option value="e/General">Choose an Era (Optional)</option>
                    {eras.filter(e => e !== 'All Eras').map(era => (
                      <option key={era} value={era}>{era}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <input 
                    type="text" 
                    placeholder="Title your discovery..." 
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    maxLength={100}
                    className="w-full bg-transparent border-b border-amber-900/50 px-2 py-3 text-xl font-heading text-amber-50 placeholder:text-amber-900/50 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <textarea 
                    placeholder="Share your historical insights, theories, or guides..." 
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={6}
                    className="w-full bg-black/20 border border-amber-900/30 rounded-xl p-4 text-amber-100/90 placeholder:text-amber-900/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none text-sm leading-relaxed"
                    required
                  />
                </div>

                {/* --- IMAGE UPLOAD SECTION --- */}
                <div>
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-amber-900/30 bg-black/40">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      <button 
                        type="button" 
                        onClick={clearImage} 
                        className="absolute top-2 right-2 p-1.5 bg-black/70 backdrop-blur-sm rounded-full text-amber-500 hover:text-amber-400 hover:bg-black transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-bold uppercase tracking-wider text-amber-600/80 hover:text-amber-400 transition-colors bg-amber-900/10 px-4 py-2 rounded-lg border border-amber-900/30 hover:border-amber-500/50">
                      <ImageIcon size={18} />
                      <span>Attach an Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-amber-900/30">
                  <button 
                    type="submit"
                    disabled={!newPost.title || !newPost.content}
                    className="mt-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-amber-950 font-bold px-8 py-2.5 rounded-full transition-colors flex items-center gap-2"
                  >
                    <Send size={16} /> Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// NavLink Component matching ExplorePage & HomePage styling
function NavLink({ icon, label, onClick, isActive }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 font-medium transition-colors group relative ${isActive ? 'text-amber-400' : 'text-amber-200/70 hover:text-amber-100'}`}
    >
      <span className="group-hover:-translate-y-0.5 transition-transform duration-300">{icon}</span>
      <span>{label}</span>
      <span className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${isActive ? 'w-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'w-0 bg-amber-400 group-hover:w-full'}`}></span>
    </button>
  );
}

// Static Footer Helper Components
function FooterLink({ label }) {
  return (
    <li>
      <span className="cursor-pointer hover:text-amber-200 transition-all flex items-center gap-2 group text-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 group-hover:bg-amber-400 transition-colors group-hover:scale-125"></span>
        <span className="group-hover:translate-x-1 transition-transform">{label}</span>
      </span>
    </li>
  );
}

function SocialIcon({ icon }) {
  return (
    <button className="w-9 h-9 rounded-full bg-amber-950/40 border border-amber-900/50 flex items-center justify-center hover:bg-amber-900 hover:border-amber-600 hover:text-amber-100 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(217,119,6,0.2)]">
      {icon}
    </button>
  );
}