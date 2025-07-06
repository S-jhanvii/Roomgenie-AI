import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaMagic, FaSpinner, FaImages, FaArrowLeft, FaDownload, FaShareAlt } from 'react-icons/fa';
import Confetti from 'react-confetti';

export default function App() {
  // State Management
  const [selectedFile, setSelectedFile] = useState(null);
  const [theme, setTheme] = useState('');
  const [originalImage, setOriginalImage] = useState(null);
  const [designedImage, setDesignedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('before');
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mood, setMood] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [designScore, setDesignScore] = useState(null);
  const [showTips, setShowTips] = useState(false);
  const [badges, setBadges] = useState([]);
  const fileInputRef = useRef(null);

  // Data
  const moodThemes = {
    cozy: ['Rustic', 'Bohemian', 'Farmhouse'],
    energetic: ['Modern', 'Industrial', 'Art Deco'],
    calm: ['Minimalist', 'Scandinavian', 'Japandi']
  };

  const themePreviews = [
    { name: 'Bohemian', emoji: '🌿' },
    { name: 'Modern', emoji: '🏙️' },
    { name: 'Luxury', emoji: '💎' },
    { name: 'Minimalist', emoji: '🧘‍♀️' },
    { name: 'Rustic', emoji: '🪵' },
    { name: getSeasonalTheme()?.theme || 'Scandinavian', emoji: getSeasonalTheme()?.emoji || '❄️' }
  ];

  const furnitureItems = [
    { name: 'sofa', emoji: '🛋️' },
    { name: 'plant', emoji: '🌱' },
    { name: 'lamp', emoji: '💡' },
    { name: 'art', emoji: '🖼️' }
  ];

  const designerTips = {
    Bohemian: "Mix patterns and textures for authentic boho vibe. Add plants and vintage items.",
    Modern: "Keep surfaces clean. Use geometric shapes and metallic accents.",
    Luxury: "Incorporate velvet textures and gold/marble elements.",
    Minimalist: "Stick to a neutral palette with one accent color."
  };

  // Effects
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + (10 + Math.random() * 20);
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  // Helper Functions
  function getSeasonalTheme() {
    const month = new Date().getMonth();
    if (month === 11) return { theme: 'Christmas', emoji: '🎄' };
    if (month >= 9) return { theme: 'Halloween', emoji: '🎃' };
    if (month >= 5 && month < 9) return { theme: 'Summer', emoji: '🏖️' };
    return null;
  }

  function unlockBadge(badgeName) {
    if (!badges.includes(badgeName)) {
      setBadges([...badges, badgeName]);
    }
  }

  // Main Functions
  const handleGenerate = async () => {
    if (!selectedFile || !theme) {
      alert('Please upload an image and select a theme!');
      return;
    }

    setLoading(true);
    setOriginalImage(URL.createObjectURL(selectedFile));
    setDesignedImage(null);
    setShowConfetti(false);
    setDesignScore(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('theme', theme);
      formData.append('intensity', intensity);

      const res = await axios.post('http://localhost:5000/api/redesign', formData);
      
      setDesignedImage(res.data.redesignedImageUrl);
      setViewMode('compare');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Calculate score and unlock badges
      const score = Math.floor(Math.random() * 50) + 50;
      setDesignScore(score);
      
      unlockBadge('First Design');
      if (score > 80) unlockBadge('Design Master');
      if (intensity > 80) unlockBadge('Bold Creator');
    } catch (err) {
      console.error('Error:', err);
      alert('The magic spell failed! Let\'s try again 🪄');
    } finally {
      setLoading(false);
    }
  };

  const handleNewDesign = () => {
    setSelectedFile(null);
    setOriginalImage(null);
    setDesignedImage(null);
    setTheme('');
    setMood('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center p-4 md:p-8">
      {/* Confetti Celebration */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-purple-600 mb-2 flex items-center justify-center gap-2">
          <FaMagic className="text-pink-500 animate-pulse" />
          RoomGenie
          <span className="text-2xl">🧞‍♀️</span>
        </h1>
        <p className="text-purple-500 font-medium max-w-md">
          Transform your room photos into dreamy designs instantly!
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-6 w-full max-w-2xl flex flex-col gap-5 border border-purple-200/50">
        {!originalImage ? (
          <>
            {/* File Upload */}
            <div 
              className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-purple-50 transition"
              onClick={() => fileInputRef.current.click()}
            >
              <FaImages className="mx-auto text-3xl text-purple-400 mb-3" />
              <p className="text-purple-600 font-medium">
                {selectedFile ? selectedFile.name : 'Click to upload your room photo'}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Mood Selector */}
            <div className="mb-4">
              <p className="text-sm text-purple-600 mb-1">How do you want to feel?</p>
              <div className="flex gap-2">
                {Object.keys(moodThemes).map((m) => (
                  <button 
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      mood === m ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {mood && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {moodThemes[mood].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setTheme(theme)}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs"
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {themePreviews.map((t) => (
                <div 
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={`cursor-pointer p-2 rounded-lg border-2 ${
                    theme === t.name ? 'border-purple-400 bg-purple-50' : 'border-transparent'
                  } transition`}
                >
                  <div className="bg-purple-100 rounded-md mb-1 h-20 w-full flex items-center justify-center text-3xl">
                    {t.emoji}
                  </div>
                  <p className="text-center text-xs font-medium">{t.name}</p>
                </div>
              ))}
            </div>

            {/* Style Intensity */}
            <div className="mb-4">
              <label className="flex justify-between text-sm text-purple-600 mb-1">
                <span>Style Intensity</span>
                <span>{intensity}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtle</span>
                <span>Bold</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedFile || !theme}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold transition-all ${
                loading ? 'bg-purple-400' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-purple-200'
              } ${
                (!selectedFile || !theme) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Brewing Magic...
                </>
              ) : (
                <>
                  <FaMagic />
                  Generate Magic!
                </>
              )}
            </button>
          </>
        ) : (
          /* Results View */
          <div className="flex flex-col gap-4">
            {/* View Toggle */}
            <div className="flex gap-2 justify-center mb-4">
              <button
                onClick={() => setViewMode('before')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'before' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setViewMode('after')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'after' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'
                }`}
              >
                After
              </button>
              {designedImage && (
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-4 py-2 rounded-lg ${
                    viewMode === 'compare' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' : 'bg-gray-100'
                  }`}
                >
                  Compare
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-purple-600">
                  <span>🧹 Cleaning</span>
                  <span>🛋️ Furnishing</span>
                  <span>🎨 Decorating</span>
                  <span>✨ Finishing</span>
                </div>
              </div>
            )}

            {/* Design Score */}
            {designScore && (
              <div className="bg-purple-50 p-3 rounded-lg mb-3">
                <h4 className="font-medium text-purple-700 mb-1">Design Score: {designScore}/100</h4>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${designScore}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">
                  {designScore > 80 ? "Stunning! ✨" : 
                   designScore > 60 ? "Looking good! 😊" : "Try adjusting your theme!"}
                </p>
              </div>
            )}

            {/* Designer Tips */}
            {designedImage && designerTips[theme] && (
              <div>
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="text-purple-600 text-sm flex items-center gap-1 mb-1"
                >
                  {showTips ? 'Hide' : 'Show'} Designer Tips
                  <span>💡</span>
                </button>
                {showTips && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-3 text-sm">
                    {designerTips[theme]}
                  </div>
                )}
              </div>
            )}

            {/* Image Display */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg">
              {viewMode === 'before' && (
                <img 
                  src={originalImage} 
                  alt="Original room" 
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              
              {viewMode === 'after' && designedImage && (
                <img 
                  src={designedImage} 
                  alt="Designed room" 
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              
              {viewMode === 'compare' && designedImage && (
                <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 overflow-hidden border-r-2 border-white">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-1/2 overflow-hidden">
                      <img 
                        src={designedImage} 
                        alt="Redesigned" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                    ↔️
                  </div>
                </div>
              )}

              {loading && !designedImage && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-white text-center">
                    <FaSpinner className="animate-spin text-3xl mb-2 mx-auto" />
                    <p>Your room transformation is in progress...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-purple-600 mb-1">Your Badges</h4>
                <div className="flex gap-2">
                  {badges.map((badge, i) => (
                    <div 
                      key={i}
                      className="bg-yellow-100 text-yellow-800 p-2 rounded-full flex items-center gap-1 text-sm"
                    >
                      {badge === 'First Design' && '🌟'}
                      {badge === 'Design Master' && '🏆'}
                      {badge === 'Bold Creator' && '🎨'}
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleNewDesign}
                className="flex items-center gap-2 bg-white border border-purple-300 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
              >
                <FaArrowLeft />
                New Design
              </button>
              {designedImage && (
                <>
                  <a
                    href={designedImage}
                    download="roomgenie-design.jpg"
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <FaDownload />
                    Download
                  </a>
                  <button className="bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center">
                    <FaShareAlt />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-purple-400 text-sm">
        ✨ Made with magic by RoomGenie ✨
      </p>
    </div>
  );
}