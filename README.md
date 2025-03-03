# Intelligent Proctoring System for Secure Remote Assessments

Welcome to the **Intelligent Proctoring System for Secure Remote Assessments** repository. This project provides a cost-effective, AI-powered, dual-camera proctoring solution for secure and fair online examinations. Built with cutting-edge technologies like TensorFlow.js, Node.js, and MongoDB, it ensures robust exam integrity while being accessible across multiple devices and platforms.

---

## 🚀 Features

- **Dual-Camera Setup**: Combines primary (laptop/desktop) and secondary (mobile/tablet) cameras to provide multiple perspectives for enhanced monitoring.
- **AI-Powered Proctoring**: Utilizes TensorFlow.js with the COCO-SSD model for real-time object detection and behavior analysis.
- **Cross-Platform Compatibility**: Works seamlessly across major browsers (Chrome, Firefox, Safari, Edge) and operating systems (Windows, macOS, Android, iOS).
- **Real-Time Monitoring**:
  - Face detection
  - Multiple face detection
  - Unauthorized object detection (e.g., mobile phones, books)
  - Tab switch and keypress detection
- **Scalable & Secure**:
  - NoSQL database (MongoDB) for efficient data handling
  - JWT-based authentication
  - HTTPS support for secure communication
- **Web-Based**: No software installation required; works directly in browsers.
- **User-Friendly Interface**: Clean, intuitive UI for students and teachers with easy onboarding.

---

## 📂 Project Structure

```plaintext
├── public/                # Static files (CSS, JavaScript, images)
├── views/                 # Pug templates for dynamic HTML rendering
├── routes/                # Express.js routes for API and views
├── controllers/           # Logic for handling requests
├── models/                # Mongoose schemas for MongoDB
├── utils/                 # Utility functions and middlewares
├── app.js                 # Main application setup
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

---

## 🛠️ Technologies Used

- **Frontend**:
  - HTML, CSS, JavaScript
  - Pug.js for templating
  - Axios for API requests
- **Backend**:
  - Node.js, Express.js
  - Socket.IO for real-time communication
  - bcrypt.js for password hashing
- **AI/ML**:
  - TensorFlow.js
  - COCO-SSD for object detection
- **Database**:
  - MongoDB with Mongoose ODM
- **Other Tools**:
  - WebRTC for peer-to-peer video streaming
  - SweetAlert2 for enhanced user notifications
  - dotenv for environment configuration

---

## 🖥️ Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud-based)
- Modern web browser (e.g., Chrome, Firefox)

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/intelligent-proctoring.git
   cd intelligent-proctoring
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and define the following variables:
   ```plaintext
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

## 🚧 Future Enhancements

- Improve object detection accuracy, especially for smaller objects.
- Implement biometric identification (e.g., facial recognition, fingerprint scanning).
- Enhance scalability for handling higher user loads.
- Integrate with Learning Management Systems (LMS) for seamless adoption.
- Provide real-time user support during exams.

---

## 🧪 Testing

### Unit Tests
- Focus on individual components like camera initialization, API responses, and object detection.

### Integration Tests
- Test interactions between components such as the primary and secondary camera setup and client-server communication.

### End-to-End Tests
- Simulate user workflows like logging in, joining exams, and submitting results.

---

## 🛡️ Security and Privacy

- **Authentication**: JSON Web Tokens (JWT) for secure session management.
- **Data Encryption**: Passwords hashed using bcrypt.js.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature-name"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## 📧 Contact

For questions or feedback, please contact **Udit Bhatia** at **https://www.linkedin.com/in/uditbhatia121/**.

--- 

Start building secure and scalable online examination solutions today! 😊
