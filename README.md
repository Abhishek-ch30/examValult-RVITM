# examValult-RVITM
A comprehensive online examination system designed for RVITM (R.V. Institute of Technology and Management) to facilitate digital quiz and exam management.

## Features

- **User Management**
  - Separate interfaces for students and teachers
  - Secure authentication system
  - Profile management with department and role-based access

- **Quiz Management**
  - Create and manage quizzes with customizable settings
  - Set duration and total marks for each quiz
  - Support for multiple question types
  - Difficulty levels (Easy, Medium, Hard)

- **Exam System**
  - Real-time quiz attempts
  - Automatic scoring system
  - Detailed performance analytics
  - Timed examinations

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful architecture

## Database Schema

The system uses the following main tables:
- Users (students and teachers)
- Quizzes
- Questions
- Quiz Attempts
- Quiz Answers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- TypeScript

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/exam-vault-rvitm.git
   cd exam-vault-rvitm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a MySQL database
   - Run the schema.sql file in the src/db directory
   - Run the seed.sql file for initial data (optional)

4. Configure environment variables:
   - Create a .env file based on the provided template
   - Update database credentials and other configurations

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
exam-vault-rvitm/
├── src/
│   ├── db/
│   │   ├── config.ts
│   │   ├── queries.ts
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── ...
├── README.md
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/exam-vault-rvitm](https://github.com/yourusername/exam-vault-rvitm) 
