const mongoose = require('mongoose');

// חשוב: את כתובת ה-DB שלך שמרי בתוך משתנה קבוע
// כאן את צריכה לשים את הקישור המלא שלך, ולהחליף את ה-password בסיסמה האמיתית
const MONGO_URI = 'mongodb+srv://t0548551464_db_user:9K5BdXU4cLcMJbNn@cluster0.kbsuw8s.mongodb.net/library-server';
// יצירת פונקציית התחברות למסד הנתונים
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully!');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
    }
};

// ייצוא הפונקציה כדי שנוכל להשתמש בה בקובץ הראשי
module.exports = connectDB;