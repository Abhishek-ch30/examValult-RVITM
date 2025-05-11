
import { useEffect, useState } from 'react';
import TeacherLayout from '@/components/TeacherLayout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { userService, initializeDemoData } from '@/services/mockServices';
import { User } from '@/types';
import { Search } from 'lucide-react';

const ViewStudents = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
    
    // Fetch students
    const allStudents = userService.getStudents();
    setStudents(allStudents);
  }, []);
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout activeTab="students">
      <div className="animate-fade-in">
        <PageHeader
          title="Student Management"
          description="View and manage registered students"
        />
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name, email, USN, or department..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>USN</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.usn}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.department}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {student.gender}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No students found matching "${searchTerm}"`
                    : 'No students registered yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
};

export default ViewStudents;
