-- Insert sample users
INSERT INTO users (name, email, role, password, phone, department, gender, usn, staff_id)
VALUES 
('Prof. Sharma', 'sharma.rvitm@rvei.edu.in', 'teacher', 'teacher123', '9876543210', 'Computer Science', 'male', NULL, 'RVITMCS001'),
('Rahul Kumar', 'rahul.rvitm@rvei.edu.in', 'student', 'student123', '9876543211', 'Computer Science', 'male', '1RF23CS062', NULL);

-- Insert sample quizzes
INSERT INTO quizzes (title, description, created_by, duration, total_marks, is_active)
VALUES 
('Introduction to Programming', 'Basic concepts of programming languages', 1, 30, 3, true),
('Data Structures', 'Advanced concepts of data structures', 1, 45, 3, true);

-- Insert sample questions
INSERT INTO questions (quiz_id, question_text, options, correct_answer, difficulty)
VALUES 
(1, 'What is the output of the following code?\n\nconsole.log(1 + ''1'');', '["2", "''11''", "Error", "undefined"]', 1, 'easy'),
(1, 'Which of the following is NOT a JavaScript data type?', '["String", "Boolean", "Object", "Character"]', 3, 'medium'),
(1, 'What is the time complexity of binary search?', '["O(1)", "O(n)", "O(log n)", "O(n²)"]', 2, 'hard'),
(2, 'Which data structure uses LIFO principle?', '["Queue", "Stack", "Linked List", "Tree"]', 1, 'easy'),
(2, 'What is the worst-case time complexity for searching in a balanced binary search tree?', '["O(1)", "O(n)", "O(log n)", "O(n²)"]', 2, 'medium'),
(2, 'Which sorting algorithm has the best average-case performance?', '["Bubble Sort", "Insertion Sort", "Merge Sort", "Quick Sort"]', 3, 'hard'); 