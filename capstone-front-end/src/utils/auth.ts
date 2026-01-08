/**
 * Get current user ID from multiple sources
 */
export const getCurrentUserId = (fallbackId?: string): string => {
  // 1. Try direct userId in localStorage
  let userId = localStorage.getItem('userId');
  if (userId) {
    console.log('✅ Found userId in localStorage:', userId);
    return userId;
  }

  // 2. Try to get from user object
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      if (user.userId) {
        console.log('✅ Found userId in user object:', user.userId);
        // Cache it for next time
        localStorage.setItem('userId', user.userId);
        return user.userId;
      }
    } catch (e) {
      console.error('Error parsing user object:', e);
    }
  }

  // 3. Try to extract from JWT token
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('📄 JWT payload:', payload);

        userId = payload.sub || payload.userId || payload.id || payload.user_id;
        if (userId) {
          console.log('✅ Found userId in JWT:', userId);
          localStorage.setItem('userId', userId);
          return userId;
        }
      }
    } catch (e) {
      console.error('Error parsing JWT token:', e);
    }
  }

  // 4. Use fallback if provided
  if (fallbackId) {
    console.warn('⚠️ Using fallback userId:', fallbackId);
    return fallbackId;
  }

  // 5. Throw error if nothing works
  console.error('❌ No userId found anywhere! ');
  throw new Error(
    'Không tìm thấy thông tin người dùng.  Vui lòng đăng nhập lại.',
  );
};

/**
 * Get current user info
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user:', e);
      return null;
    }
  }
  return null;
};

/**
 * Clear all auth data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
  localStorage.removeItem('username');
  sessionStorage.clear();
};
