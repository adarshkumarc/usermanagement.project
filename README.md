Full-Stack Application Documentation
Tech Stack
Backend: Node.js (Express.js)
Frontend: React.js/Next.js
Database: MongoDB
Email Service: Node-mailer
Project Overview
This project is a full-stack application that includes user registration, OTP-based login, user profile management, and email confirmation functionalities.
Folder Structure
java
Copy code
project-root/
│
├── backend/
│   ├── controllers/
│   │   └── UserController.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── user.js
│   ├── config/
│   │   └── db.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Signup.js
│   │   │   ├── Login.js
│   │   │   ├── Profile.js
│   │   │   └── ConfirmEmail.js
│   │   ├── App.js
│   │   ├── api.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── README.md

Backend Documentation
1. Setup Instructions
File: backend/.env Create a .env file in the backend folder with the following content:
makefile
Copy code
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:3000

File: backend/package.json Install the necessary dependencies:
Json
Copy code
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "Bcrypt": "^5.0.1",
    "Dotenv": "^10.0.0",
    "Express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.0.12",
    "nodemailer": "^6.6.3"
  },
  "scripts": {
    "start": "node server.js"
  }
}

Command:
bash
Copy code
cd backend
npm install

File: backend/server.js
javascript
Copy code
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api', userRoutes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

2. API Endpoints
File: backend/routes/user.js
javascript
Copy code
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.post('/otp-login', UserController.otpLogin);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

module.exports = router;

File: backend/models/User.js
javascript
Copy code
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
});

module.exports = mongoose.model('User', UserSchema);

File: backend/controllers/UserController.js
javascript
Copy code
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = crypto.randomBytes(3).toString('hex');

  const user = new User({ name, email, password: hashedPassword, otp });
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Email Verification',
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send(error.toString());
    res.status(200).send('Signup successful, please check your email for OTP');
  });
};

const otpLogin = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp });

  if (!user) return res.status(400).send('Invalid OTP');

  user.isVerified = true;
  user.otp = '';
  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json(user);
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { name, email }, { new: true });
  res.status(200).json(user);
};

module.exports = { signup, otpLogin, getProfile, updateProfile };

Frontend Documentation
1. Setup Instructions
File: frontend/package.json Install the necessary dependencies:
json
Copy code
{
  "name": "frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^0.21.1",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^5.2.0",
    "react-scripts": "4.0.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}

Command:
bash
Copy code
cd frontend
npm install
npm start

2. API Integration
File: frontend/src/api.js
javascript
Copy code
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const signup = (data) => api.post('/signup', data);
export const otpLogin = (data) => api.post('/otp-login', data);
export const fetchProfile = (token) => api.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
export const updateProfile = (data, token) => api.put('/profile', data, { headers: { Authorization: `Bearer ${token}` } });

export default api;

3. Components
File: frontend/src/components/Signup.js
javascript
Copy code
import React, { useState } from 'react';
import { signup } from '../api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ name, email, password });
      alert('Signup successful, check your email for confirmation');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;

File: frontend/src/components/Login.js
javascript
Copy code
import React, { useState } from 'react';
import { otpLogin } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp]

 Initialize a Git Repository
First, make sure Git is installed on your machine. You can download it from here.
Open your terminal or command prompt, navigate to your project root directory, and initialize a Git repository:
bash
Copy code
cd path/to/project-root
git init

2. Create a .gitignore File
Create a .gitignore file in both the backend and frontend directories to exclude unnecessary files from being tracked by Git.
File: backend/.gitignore
bash
Copy code
node_modules/
.env

File: frontend/.gitignore
Copy code
node_modules/
build/

3. Commit Your Changes
Add all your files to the staging area and commit them:
bash
Copy code
git add .
git commit -m "Initial commit"

4. Create a New Repository on GitHub
Go to GitHub and log in.
Click the "New repository" button.
Enter a repository name and description, and choose whether it should be public or private.
Click "Create repository".
5. Push Your Code to GitHub
Follow the instructions provided by GitHub to push your local repository to the remote repository. You can find these instructions on the repository page right after you create it.
Run these commands in your terminal:
bash
Copy code
git remote add origin https://github.com/your-username/your-repository-name.git
git branch -M main
git push -u origin main

Example
Assuming your GitHub username is your-username and your repository name is fullstack-app, the commands would look like this:
bash
Copy code
git remote add origin https://github.com/your-username/fullstack-app.git
git branch -M main
git push -u origin main

6. Verify on GitHub
Go to your GitHub repository page and verify that your files have been uploaded correctly.
Complete Example Workflow
Here's a complete example of how you might go through the entire process:
bash
Copy code
# Navigate to your project root directory
cd path/to/project-root

# Initialize Git repository
git init

# Create .gitignore files
echo "node_modules/\n.env" > backend/.gitignore
echo "node_modules/\nbuild/" > frontend/.gitignore

# Add and commit files
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub
# (Do this step on GitHub website)

# Add remote repository and push code
git remote add origin https://github.com/your-username/fullstack-app.git
git branch -M main
git push -u origin main
