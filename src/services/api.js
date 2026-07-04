import { supabase } from './supabaseClient.js';

export const api = {
  // --- CATALOG SERVICES ---

  async getCatalog() {
    const { data, error } = await supabase
      .from('movies')
      .select('*');

    if (error) {
      throw new Error(error.message || 'Failed to fetch catalog from database');
    }

    const CATEGORY_NAMES = {
      trending: 'Trending Now',
      toprated: 'Top Rated Releases',
      action: 'Action Blockbusters',
      comedy: 'Comedy Hits',
      horror: 'Horror & Thrillers',
      romance: 'Romance & Drama',
      scifi: 'Sci-Fi & Cyberpunk Hits',
      documentaries: 'Captivating Documentaries',
      popular: 'Popular on QStream'
    };

    // Group the movies by category
    const categoriesMap = {};
    
    // Initialize categories in the desired order
    const orderedCategoryKeys = [
      'trending',
      'toprated',
      'action',
      'comedy',
      'horror',
      'romance',
      'scifi',
      'documentaries',
      'popular'
    ];
    
    orderedCategoryKeys.forEach(key => {
      categoriesMap[key] = {
        id: key,
        title: CATEGORY_NAMES[key] || key,
        movies: []
      };
    });

    data.forEach(item => {
      const cat = item.category;
      if (categoriesMap[cat]) {
        categoriesMap[cat].movies.push({
          id: String(item.id),
          title: item.title,
          image: item.image,
          match: item.match,
          rating: item.rating,
          duration: item.duration,
          genres: item.genres,
          isAdded: false,
          tmdbId: item.tmdb_id || String(item.id),
          type: item.type
        });
      }
    });

    return orderedCategoryKeys
      .map(key => categoriesMap[key])
      .filter(cat => cat.movies.length > 0);
  },

  // --- AUTH SERVICES ---
  
  // Register new account
  async register(fullName, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Registration failed');
    }

    const user = data.user;
    if (user) {
      // Seed default main profile for new registers (matching original Express backend behavior)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: fullName.split(' ')[0],
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
          color: '#e50914'
        });
      if (profileError) {
        console.error('Failed to seed default profile:', profileError.message);
      }
    }

    // Save token flag in client storage to satisfy App.jsx session checks
    localStorage.setItem('netflix_token', data.session?.access_token || 'supabase_session');

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || fullName
      }
    };
  },

  // Login existing account
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message || 'Login failed');
    }

    // Save token flag in client storage to satisfy App.jsx session checks
    localStorage.setItem('netflix_token', data.session?.access_token || 'supabase_session');

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || email.split('@')[0]
      }
    };
  },

  // Verify token validation
  async getMe() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('Session verification failed');
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email.split('@')[0]
      }
    };
  },

  // Logout from Supabase
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Logout failed');
    }
    localStorage.removeItem('netflix_token');
  },

  // --- PROFILE SERVICES ---
  
  // Fetch profiles belonging to user
  async getProfiles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message || 'Failed to fetch profiles');
    }
    return data;
  },

  // Create profile
  async createProfile(name, avatar, color) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name,
        avatar,
        color
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create profile');
    }
    return data;
  },

  // Delete profile
  async deleteProfile(profileId) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      throw new Error(error.message || 'Failed to delete profile');
    }
    return { message: 'Profile deleted successfully.' };
  },

  // --- WATCHLIST SERVICES ---
  
  // Fetch profile watchlist items
  async getWatchlist(profileId) {
    const { data, error } = await supabase
      .from('watchlists')
      .select('movie_id')
      .eq('profile_id', profileId);

    if (error) {
      throw new Error(error.message || 'Failed to fetch watchlist');
    }
    return data.map(item => item.movie_id);
  },

  // Toggle movie in profile watchlist
  async toggleWatchlist(profileId, movieId) {
    // Check if item already exists in watchlist
    const { data: existing, error: fetchError } = await supabase
      .from('watchlists')
      .select('id')
      .eq('profile_id', profileId)
      .eq('movie_id', movieId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message || 'Failed to retrieve watchlist details');
    }

    if (existing) {
      // Remove from watchlist
      const { error: deleteError } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to remove watchlist item');
      }
      return { success: true, isAdded: false };
    } else {
      // Add to watchlist
      const { error: insertError } = await supabase
        .from('watchlists')
        .insert({
          profile_id: profileId,
          movie_id: movieId
        });

      if (insertError) {
        throw new Error(insertError.message || 'Failed to add watchlist item');
      }
      return { success: true, isAdded: true };
    }
  },

  // --- ACCOUNT/USER MANAGEMENT SERVICES ---
  
  // Update account password
  async updatePassword(currentPassword, newPassword) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Not authenticated');
    }

    // Re-authenticate user to verify their current password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (authError) {
      throw new Error('Incorrect current password.');
    }

    // Proceed to update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw new Error(updateError.message || 'Failed to update password');
    }
    return { success: true };
  },

  // Update profile user metadata (Full Name)
  async updateProfileMetadata(fullName) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName
      }
    });
    if (error) {
      throw new Error(error.message || 'Failed to update name');
    }
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || fullName
      }
    };
  },

  // Permanently delete user account
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      throw new Error(error.message || 'Failed to delete account');
    }
    localStorage.removeItem('netflix_token');
    return { success: true };
  }
};
