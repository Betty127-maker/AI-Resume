
export interface User {
  email: string;
  isVerified: boolean;
}

interface StoredUser extends User {
  password: string; // In a real app, this would be hashed
}

const STORAGE_KEY = 'registered_users';
const SESSION_KEY = 'auth_session';

export const authService = {
  getUsers(): StoredUser[] {
    const users = localStorage.getItem(STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUsers(users: StoredUser[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  signup(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    // Auto-verify user immediately
    const newUser: StoredUser = {
      email,
      password,
      isVerified: true
    };
    
    users.push(newUser);
    this.saveUsers(users);

    // Create session immediately
    const sessionUser = { email: newUser.email, isVerified: true };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, message: 'Account created successfully.', user: sessionUser };
  },

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Legacy check for old unverified users, though new flow sets true immediately
    if (!user.isVerified) {
      // Auto-fix for legacy data in this demo
      user.isVerified = true;
      this.saveUsers(users);
    }

    const sessionUser = { email: user.email, isVerified: true };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true, message: 'Login successful', user: sessionUser };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};
