import React, { useState, useEffect } from 'react';
import { Heart, Star, Users, TrendingUp, LogOut, Plus, Send } from 'lucide-react';
import './App.css';
 
const MealApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [meals, setMeals] = useState([]);
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [newMeal, setNewMeal] = useState({ caption: '', healthScore: 5 });
  const [searchFriend, setSearchFriend] = useState('');
 
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mealApp');
    if (saved) {
      const data = JSON.parse(saved);
      setUsers(data.users || []);
      setMeals(data.meals || []);
      setCurrentUser(data.currentUser);
    }
  }, []);
 
  // Save to localStorage whenever data changes
  useEffect(() => {
    if (users.length > 0 || meals.length > 0 || currentUser) {
      localStorage.setItem('mealApp', JSON.stringify({ users, meals, currentUser }));
    }
  }, [users, meals, currentUser]);
 
  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    let user = users.find(u => u.id === username.toLowerCase());
    if (!user) {
      user = {
        id: username.toLowerCase(),
        name: username,
        score: 0,
        mealsPosted: 0,
        friends: [],
        isCoach: false,
        avgRating: 0
      };
      setUsers([...users, user]);
    }
    setCurrentUser(user);
    setView('feed');
    setUsername('');
  };
 
  const handlePostMeal = (e) => {
    e.preventDefault();
    if (!newMeal.caption.trim()) return;
 
    const meal = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      caption: newMeal.caption,
      healthScore: newMeal.healthScore,
      timestamp: new Date().toLocaleString(),
      ratings: [],
      avgRating: 0
    };
 
    setMeals([meal, ...meals]);
    setNewMeal({ caption: '', healthScore: 5 });
    
    // Update user score
    const updatedUsers = users.map(u => 
      u.id === currentUser.id 
        ? { ...u, mealsPosted: u.mealsPosted + 1, score: u.score + 10 }
        : u
    );
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, mealsPosted: currentUser.mealsPosted + 1, score: currentUser.score + 10 });
  };
 
  const handleRateMeal = (mealId, rating) => {
    const updatedMeals = meals.map(m => {
      if (m.id === mealId) {
        const newRatings = [
          ...m.ratings.filter(r => r.ratedBy !== currentUser.id),
          { ratedBy: currentUser.id, rating }
        ];
        const avgRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        return { ...m, ratings: newRatings, avgRating };
      }
      return m;
    });
    setMeals(updatedMeals);
 
    // Update rater's score
    const updatedUsers = users.map(u =>
      u.id === currentUser.id
        ? { ...u, score: u.score + 5 }
        : u
    );
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, score: currentUser.score + 5 });
  };
 
  const handleAddFriend = (friendId) => {
    if (currentUser.friends.includes(friendId)) return;
    
    const updatedCurrentUser = { ...currentUser, friends: [...currentUser.friends, friendId] };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedCurrentUser : u);
    
    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    setSearchFriend('');
  };
 
  const toggleCoachMode = () => {
    const updatedUser = { ...currentUser, isCoach: !currentUser.isCoach };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
  };
 
  const leaderboard = [...users].sort((a, b) => b.score - a.score);
  const friendsMeals = meals.filter(m => currentUser.friends.includes(m.userId));
  const coachMeals = view === 'coach' ? meals.filter(m => currentUser.friends.includes(m.userId)) : [];
 
  if (!currentUser) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>NutriMeal</h1>
          <p>Share your healthy meals with friends. Get rated. Stay accountable.</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Enter App</button>
          </form>
        </div>
      </div>
    );
  }
 
  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>NutriMeal</h1>
        <div className="header-right">
          <span>Score: {currentUser.score}</span>
          <button onClick={() => { setCurrentUser(null); setView('login'); }} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>
 
      {/* Navigation */}
      <div className="nav">
        {['feed', 'leaderboard', 'friends', 'profile'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`nav-btn ${view === v ? 'active' : ''}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
        {currentUser.isCoach && (
          <button
            onClick={() => setView('coach')}
            className={`nav-btn ${view === 'coach' ? 'active' : ''}`}
          >
            Coach View
          </button>
        )}
      </div>
 
      {/* Content */}
      <div className="content">
        {view === 'feed' && (
          <>
            {/* Post Meal Form */}
            <div className="card post-card">
              <h3>Share a meal</h3>
              <form onSubmit={handlePostMeal}>
                <textarea
                  placeholder="What did you eat? (e.g., Grilled chicken, broccoli, brown rice)"
                  value={newMeal.caption}
                  onChange={(e) => setNewMeal({ ...newMeal, caption: e.target.value })}
                />
                <div className="health-slider">
                  <label>Health level:</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newMeal.healthScore}
                    onChange={(e) => setNewMeal({ ...newMeal, healthScore: parseInt(e.target.value) })}
                  />
                  <span>{newMeal.healthScore}/10</span>
                </div>
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Post Meal
                </button>
              </form>
            </div>
 
            {/* Feed */}
            {friendsMeals.length === 0 ? (
              <div className="empty-state">
                <p>No meals from friends yet. Add friends to see their meals!</p>
              </div>
            ) : (
              friendsMeals.map(meal => (
                <div key={meal.id} className="card meal-card">
                  <div className="meal-header">
                    <div>
                      <p className="meal-user">{meal.userName}</p>
                      <p className="meal-time">{meal.timestamp}</p>
                    </div>
                    <span className="health-badge">Health {meal.healthScore}/10</span>
                  </div>
                  <p className="meal-caption">{meal.caption}</p>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleRateMeal(meal.id, star)}
                        className="star-btn"
                      >
                        <Star
                          size={20}
                          fill={star <= (meal.ratings.find(r => r.ratedBy === currentUser.id)?.rating || 0) ? '#EF9F27' : 'none'}
                          color="#EF9F27"
                        />
                      </button>
                    ))}
                  </div>
                  {meal.ratings.length > 0 && (
                    <p className="meal-rating">Avg rating: {meal.avgRating.toFixed(1)} ⭐ ({meal.ratings.length} {meal.ratings.length === 1 ? 'rating' : 'ratings'})</p>
                  )}
                </div>
              ))
            )}
          </>
        )}
 
        {view === 'leaderboard' && (
          <div className="card">
            {leaderboard.map((user, idx) => (
              <div key={user.id} className="leaderboard-item">
                <div className="leaderboard-rank">
                  <span className="rank-number">{idx + 1}.</span>
                  <div>
                    <p className="user-name">{user.name}</p>
                    <p className="user-meals">{user.mealsPosted} meals</p>
                  </div>
                </div>
                <span className="score-badge">{user.score} pts</span>
              </div>
            ))}
          </div>
        )}
 
        {view === 'friends' && (
          <>
            <div className="card">
              <h3>Add friends</h3>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                />
              </div>
              {searchFriend && (
                <div className="search-results">
                  {users
                    .filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(searchFriend.toLowerCase()))
                    .map(user => (
                      <div key={user.id} className="search-result-item">
                        <span>{user.name}</span>
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          disabled={currentUser.friends.includes(user.id)}
                          className={`btn-add ${currentUser.friends.includes(user.id) ? 'added' : ''}`}
                        >
                          {currentUser.friends.includes(user.id) ? 'Added' : 'Add'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
 
            <div style={{ marginTop: '16px' }}>
              <h3>Your friends ({currentUser.friends.length})</h3>
              {currentUser.friends.length === 0 ? (
                <p className="text-secondary">No friends yet. Search above to add some!</p>
              ) : (
                <div className="friends-grid">
                  {currentUser.friends.map(friendId => {
                    const friend = users.find(u => u.id === friendId);
                    return friend ? (
                      <div key={friendId} className="friend-card">
                        <p className="friend-name">{friend.name}</p>
                        <p className="friend-score">Score: {friend.score}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </>
        )}
 
        {view === 'profile' && (
          <>
            <div className="card profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <h2>{currentUser.name}</h2>
              </div>
              
              <div className="profile-stats">
                <div className="stat">
                  <p className="stat-label">Score</p>
                  <p className="stat-value">{currentUser.score}</p>
                </div>
                <div className="stat">
                  <p className="stat-label">Meals Posted</p>
                  <p className="stat-value">{currentUser.mealsPosted}</p>
                </div>
              </div>
 
              <button
                onClick={toggleCoachMode}
                className={`btn-coach ${currentUser.isCoach ? 'active' : ''}`}
              >
                {currentUser.isCoach ? '✓ Nutrition Coach' : 'Become a Coach'}
              </button>
            </div>
          </>
        )}
 
        {view === 'coach' && currentUser.isCoach && (
          <div>
            <h2 style={{ marginBottom: '12px' }}>Client Meals</h2>
            {coachMeals.length === 0 ? (
              <p className="text-secondary" style={{ textAlign: 'center' }}>No meals from clients yet</p>
            ) : (
              coachMeals.map(meal => (
                <div key={meal.id} className="card meal-card">
                  <div className="meal-header">
                    <div>
                      <p className="meal-user">{meal.userName}</p>
                      <p className="meal-time">{meal.timestamp}</p>
                    </div>
                    <span className="health-badge">Health {meal.healthScore}/10</span>
                  </div>
                  <p className="meal-caption">{meal.caption}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default MealApp;
