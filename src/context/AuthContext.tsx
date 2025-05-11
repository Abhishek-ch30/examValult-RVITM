import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { signInWithGoogle } from '@/services/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyOTP: (otp: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState<(Omit<User, 'id'> & { password: string }) | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOTP] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  
  useEffect(() => {
    const storedUser = localStorage.getItem('examUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('examUser');
      }
    }
    setIsLoading(false);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^rvit[0-9]{2}(bis|bcs|bec)[0-9]{3}\.rvitm@rvei\.edu\.in$/i;
    return emailPattern.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must include at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must include at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must include at least one number' };
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Password must include at least one special character' };
    }
    
    return { isValid: true, message: 'Password meets all requirements' };
  };

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    console.log('Generated OTP:', otp);
    return otp;
  };

  const verifyOTP = async (inputOTP: string): Promise<boolean> => {
    if (inputOTP === generatedOTP && tempUserData) {
      const newUser = {
        ...tempUserData,
        id: crypto.randomUUID(),
      };
      
      const users = JSON.parse(localStorage.getItem('examUsers') || '[]');
      users.push(newUser);
      localStorage.setItem('examUsers', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('examUser', JSON.stringify(userWithoutPassword));
      
      setShowOTPDialog(false);
      setTempUserData(null);
      setGeneratedOTP('');
      
      toast.success('Registration successful!');
      return true;
    } else {
      toast.error('Invalid OTP. Please try again.');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const users = JSON.parse(localStorage.getItem('examUsers') || '[]');
      const foundUser = users.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        toast.error('Invalid email or password');
        return false;
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('examUser', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome, ${userWithoutPassword.name}!`);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        return false;
      }
      
      if (userData.role === 'student' && !validateEmail(userData.email)) {
        toast.error('Invalid email format. Use format: rvitXXbis/bcs/becXXX.rvitm@rvei.edu.in');
        return false;
      }
      
      if (userData.role === 'teacher' && !userData.email.endsWith('.rvitm@rvei.edu.in')) {
        toast.error('Only emails ending with .rvitm@rvei.edu.in are allowed');
        return false;
      }

      if (userData.role === 'student' && (!userData.name || !userData.email || !userData.usn || !userData.phone || !userData.department)) {
        toast.error('Please fill all required fields: Name, Email, USN, Phone, and Department');
        return false;
      }

      if (userData.role === 'teacher' && (!userData.name || !userData.email || !userData.phone || !userData.department || !userData.staffId)) {
        toast.error('Please fill all required fields: Name, Email, Phone, Department, and Staff ID');
        return false;
      }
      
      const users = JSON.parse(localStorage.getItem('examUsers') || '[]');
      
      if (users.some((u: User) => u.email === userData.email)) {
        toast.error('Email already registered');
        return false;
      }

      setTempUserData(userData);
      generateOTP();
      setShowOTPDialog(true);
      
      toast.success('OTP has been generated! Please check your email.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('examUser');
    toast.info('Logged out successfully');
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser.email) {
        toast.error('Failed to get email from Google account');
        return false;
      }

      const users = JSON.parse(localStorage.getItem('examUsers') || '[]');
      let existingUser = users.find((u: User) => u.email === googleUser.email);

      if (!existingUser) {
        const newUser: User = {
          id: crypto.randomUUID(),
          name: googleUser.displayName || 'Google User',
          email: googleUser.email,
          role: 'student',
          department: '',
          phone: '',
          gender: 'other',
        };
        users.push(newUser);
        localStorage.setItem('examUsers', JSON.stringify(users));
        existingUser = newUser;
        
        toast.success(`Welcome to Exam Vault, ${newUser.name}! Your account has been created.`);
      } else {
        toast.success(`Welcome back, ${existingUser.name}!`);
      }

      setUser(existingUser);
      localStorage.setItem('examUser', JSON.stringify(existingUser));
      
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again or use email login.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
      isAuthenticated: !!user,
      verifyOTP,
      loginWithGoogle
    }}>
      {children}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your email address
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOTP(value)}
              render={({ slots }) => (
                <InputOTPGroup className="gap-4">
                  {slots.map((slot, i) => (
                    <InputOTPSlot key={i} index={i} {...slot} />
                  ))}
                </InputOTPGroup>
              )}
            />
            <Button 
              onClick={() => verifyOTP(otp)}
              className="w-full"
            >
              Verify OTP
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};
