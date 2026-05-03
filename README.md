# 🌱 AgriLens — AI-Powered Farming Assistant

![AgriLens Banner](https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80)

AgriLens is a comprehensive, AI-driven digital assistant designed to empower farmers with real-time insights, disease detection, and precision agriculture tools. Built using **Google's Gemini AI**, it provides localized advice to improve crop yields and sustainability.

---

## 🚀 Key Features

*   **🔍 AI Crop Scanner**: Upload or take a photo of your crop to detect diseases and receive immediate treatment recommendations.
*   **💧 Smart Irrigation**: Get a personalized 7-day irrigation schedule based on real-time weather data and soil moisture levels.
*   **🤖 AI Chatbot (AskAgent)**: A multi-lingual farming expert powered by Gemini that answers queries about fertilizers, pests, and planting techniques.
*   **📍 Location-Based Advisory**: Receive crop recommendations tailored to your specific region, soil type, and current season.
*   **🎙️ Voice Search**: Hands-free interaction supporting multiple regional languages (Hindi, Kannada, etc.).
*   **📰 AgriNews & Weather**: Stay updated with the latest agricultural news and high-precision weather forecasts.

---

## 🛠️ Technology Stack

### **Backend**
- **Framework**: FastAPI (Python)
- **AI Models**: Google Gemini (Pro, Flash, and Vision)
- **NLP**: spaCy for intent and entity recognition
- **Database**: SQLite with session-based authentication
- **Speech**: Google Web Speech API

### **Frontend**
- **Framework**: React.js
- **Styling**: Custom CSS with Glassmorphism aesthetics
- **Routing**: React Router
- **State Management**: React Context API (Auth, Theme, Language)

---

## 📦 Installation & Setup

### **1. Prerequisites**
- Python 3.9+
- Node.js 16+
- Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

### **2. Clone the Repository**
```bash
git clone https://github.com/Varshith10121901/new-Agrilens-27-02.git
cd new-Agrilens-27-02
```

### **3. Backend Setup**
1. Navigate to the Backend folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file and add your API keys:
   ```env
   GEMINI_KEY_CROP_ADVISORY=your_key_here
   GEMINI_KEY_CHATBOT=your_key_here
   GEMINI_KEY_IMPROVEMENT=your_key_here
   GEMINI_KEY_GENERAL=your_key_here
   ```

### **4. Frontend Setup**
1. Navigate to the Frontend folder:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃 How to Run

AgriLens includes a root launcher script for convenience. From the **project root**, run:

```bash
python run.py
```

This will automatically:
1. Install any missing Python/Node dependencies.
2. Launch the **FastAPI Backend** (http://localhost:8000).
3. Launch the **React Frontend** (http://localhost:3000).

---

## 📄 License
This project is for educational and hackathon purposes.

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

---
**AgriLens** — *Bridging the gap between technology and the soil.* 🌾
