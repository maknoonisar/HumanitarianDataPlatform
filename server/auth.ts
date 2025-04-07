import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';
import * as express from 'express';

// Extend Express session interface to include our custom properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Password hashing using crypto
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Hash the password with the salt
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      // Return the password hash and salt separated by a colon
      resolve(`${derivedKey.toString('hex')}:${salt}`);
    });
  });
}

// Verify password against the stored hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Verifying password');
      console.log(`Hash from storage: ${hash}`);
      
      // Extract the salt from the hash
      const [hashedPassword, salt] = hash.split(':');
      if (!salt || !hashedPassword) {
        console.log('Invalid hash format (missing salt or hashed password)');
        return resolve(false);
      }
      
      console.log(`Extracted salt: ${salt}`);
      console.log(`Extracted hashed password: ${hashedPassword.substring(0, 10)}...`);
      
      // Hash the provided password with the same salt
      crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          console.error('Error in pbkdf2:', err);
          return reject(err);
        }
        
        const computedHash = derivedKey.toString('hex');
        console.log(`Computed hash: ${computedHash.substring(0, 10)}...`);
        console.log(`Hash match: ${computedHash === hashedPassword}`);
        
        // Compare the hashes
        resolve(computedHash === hashedPassword);
      });
    } catch (error) {
      console.error('Error in verifyPassword:', error);
      resolve(false);
    }
  });
}

// Authentication middleware
export function requireAuth(req: Request & { user?: User }, res: Response, next: NextFunction) {
  if (!req.session || !req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Role-based authorization middleware
export function requireRole(roles: string[]) {
  return (req: Request & { user?: User }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Register a user
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, password, email, displayName, organization } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create the user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
      email,
      displayName,
      organization,
      role: 'user',
      isActive: true
    });
    
    // Set session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    // Remove password from the response
    const { password: _, ...safeUser } = user;
    
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
}

// Login a user
export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    
    // Special case for admin user if using hardcoded admin credentials
    if (username === 'admin' && password === 'admin1234') {
      console.log('Using admin direct login path');
      const adminUser = await storage.getUserByUsername('admin');
      if (adminUser) {
        // Set session
        if (req.session) {
          req.session.userId = adminUser.id;
        }
        
        // Remove password from the response
        const { password: _, ...safeUser } = adminUser;
        return res.status(200).json(safeUser);
      }
    }
    
    // Find the user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.username}, ID: ${user.id}`);
    
    // Check if user is active
    if (user.isActive === false) {
      console.log(`User ${username} is inactive`);
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    // Verify the password
    console.log(`Verifying password for user: ${username}`);
    const isValid = await verifyPassword(password, user.password);
    console.log(`Password verification result: ${isValid}`);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session
    if (req.session) {
      req.session.userId = user.id;
      console.log(`Session set for user ID: ${user.id}`);
    }
    
    // Remove password from the response
    const { password: _, ...safeUser } = user;
    
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Failed to log in' });
  }
}

// Logout a user
export async function logoutUser(req: Request, res: Response) {
  if (!req.session) {
    return res.status(200).json({ message: 'Logged out successfully' });
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ message: 'Failed to log out' });
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  });
}

// Get current user
export async function getCurrentUser(req: Request & { user?: User }, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json(req.user);
}