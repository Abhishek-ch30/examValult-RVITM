
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/mockServices';
import { toast } from 'sonner';
import { User } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [isEditing, setIsEditing] = useState(false);
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <p>Please log in to view your profile</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  const handleUpdateProfile = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    
    if (!name.trim() || !phone.trim() || !department.trim()) {
      toast.error('All fields are required');
      return;
    }
    
    userService.update(user.id, { name, phone, department });
    
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setName(user.name);
    setPhone(user.phone);
    setDepartment(user.department);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-12 w-12 text-secondary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.role === 'student' ? 'Student' : 'Teacher'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              
              {user.role === 'student' && user.usn && (
                <div className="space-y-2">
                  <Label htmlFor="usn">USN</Label>
                  <Input id="usn" value={user.usn} disabled />
                </div>
              )}
              
              {user.role === 'teacher' && user.staffId && (
                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input id="staffId" value={user.staffId} disabled />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" value={user.gender} disabled />
              </div>
              
              <div className="flex space-x-2 pt-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      Cancel
                    </Button>
                    <Button className="gradient-primary flex-1" onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => logout()} className="flex-1 text-red-500">
                      Logout
                    </Button>
                    <Button className="gradient-primary flex-1" onClick={handleUpdateProfile}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
