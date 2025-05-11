import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, loginWithGoogle } = useAuth();
  
  // Common form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  
  // Student-specific fields
  const [usn, setUsn] = useState('');
  
  // Teacher-specific fields
  const [staffId, setStaffId] = useState('');
  
  // Tab state
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  // Password validation states
  const [hasEightChars, setHasEightChars] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    setHasEightChars(password.length >= 8);
    setHasUpperCase(/[A-Z]/.test(password));
    setHasLowerCase(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    setHasSpecialChar(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password));
    setPasswordsMatch(password === confirmPassword && password !== '');
  }, [password, confirmPassword]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+\.rvitm@rvei\.edu\.in$/;
    return emailRegex.test(email);
  };

  const validateUSN = (usn: string) => {
    const usnRegex = /^1RF\d{2}(CS|IS|EC)\d{3}$/;
    return usnRegex.test(usn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !phone || !password || !department) {
      toast.error('All required fields must be filled');
      return;
    }
    
    if (role === 'student' && !usn) {
      toast.error('USN is required');
      return;
    }
    
    if (role === 'teacher' && !staffId) {
      toast.error('Staff ID is required');
      return;
    }
    
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!(hasEightChars && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      toast.error('Password does not meet all requirements');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Email must be in the format: yourname.rvitm@rvei.edu.in');
      return;
    }

    if (role === 'student' && !validateUSN(usn)) {
      toast.error('USN must be in the format: 1RFXXCS/IS/ECXXX where XX is your join year and XXX is your roll number');
      return;
    }
    
    // Construct user object based on role
    const userData = {
      name,
      email,
      phone,
      password,
      department,
      gender,
      role,
      ...(role === 'student' ? { usn } : {}),
      ...(role === 'teacher' ? { staffId } : {}),
    };
    
    const success = await register(userData);
    if (success) {
      navigate(role === 'student' ? '/student' : '/teacher');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate(role === 'student' ? '/student' : '/teacher');
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const PasswordRequirement = ({ 
    satisfied, 
    label 
  }: { 
    satisfied: boolean; 
    label: string 
  }) => (
    <div className="flex items-center space-x-2 text-sm">
      {satisfied ? 
        <CheckCircle className="h-4 w-4 text Gradle to-green-500" /> : 
        <XCircle className="h-4 w-4 text-red-500" />
      }
      <span className={satisfied ? "text-green-700" : "text-red-700"}>{label}</span>
    </div>
  );

  const departmentOptions = [
    'Computer Science',
    'Information Science',
    'Electronics & Communication'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <Tabs defaultValue="student" onValueChange={(value) => setRole(value as 'student' | 'teacher')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
                  <CardDescription className="text-center">
                    Create an account to access the student portal
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-usn">USN <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-usn" 
                        value={usn}
                        onChange={(e) => setUsn(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-phone" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-department">Department <span className="text-red-500">*</span></Label>
                      <Select value={department} onValueChange={setDepartment} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-gender">Gender</Label>
                      <RadioGroup 
                        value={gender} 
                        onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded">
                        <PasswordRequirement satisfied={hasEightChars} label="At least 8 characters" />
                        <PasswordRequirement satisfied={hasUpperCase} label="At least one uppercase letter" />
                        <PasswordRequirement satisfied={hasLowerCase} label="At least one lowercase letter" />
                        <PasswordRequirement satisfied={hasNumber} label="At least one number" />
                        <PasswordRequirement satisfied={hasSpecialChar} label="At least one special character" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="student-confirm-password">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input 
                        id="student-confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {confirmPassword && (
                        <PasswordRequirement satisfied={passwordsMatch} label="Passwords match" />
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full gradient-primary" 
                      disabled={isLoading || !(hasEightChars && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && passwordsMatch)}
                    >
                      {isLoading ? 'Registering...' : 'Register'}
                      <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleLogin}
                    >
                      Continue with Google
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="underline text-primary">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="teacher">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Teacher Registration</CardTitle>
                  <CardDescription className="text-center">
                    Create an account to access the teacher portal
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-staff-id">Staff ID <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-staff-id" 
                        placeholder="Enter your staff ID" 
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-email">Email <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-phone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-phone" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-department">Department <span className="text-red-500">*</span></Label>
                      <Select value={department} onValueChange={setDepartment} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-gender">Gender</Label>
                      <RadioGroup 
                        value={gender} 
                        onValueChange={(value) => setGender(value as 'male' | 'female' | 'other')}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="teacher-male" />
                          <Label htmlFor="teacher-male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="teacher-female" />
                          <Label htmlFor="teacher-female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="teacher-other" />
                          <Label htmlFor="teacher-other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded">
                        <PasswordRequirement satisfied={hasEightChars} label="At least 8 characters" />
                        <PasswordRequirement satisfied={hasUpperCase} label="At least one uppercase letter" />
                        <PasswordRequirement satisfied={hasLowerCase} label="At least one lowercase letter" />
                        <PasswordRequirement satisfied={hasNumber} label="At least one number" />
                        <PasswordRequirement satisfied={hasSpecialChar} label="At least one special character" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teacher-confirm-password">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input 
                        id="teacher-confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {confirmPassword && (
                        <PasswordRequirement satisfied={passwordsMatch} label="Passwords match" />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button 
                      type="submit" 
                      className="w-full gradient-primary" 
                      disabled={isLoading || !(hasEightChars && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && passwordsMatch)}
                    >
                      {isLoading ? 'Registering...' : 'Register'}
                      <UserPlus className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGoogleLogin}
                    >
                      Continue with Google
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link to="/login" className="underline text-primary">
                        Login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;