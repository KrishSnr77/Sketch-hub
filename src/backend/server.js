import express from 'express';
import multer from 'multer';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/submit-order', upload.single('file'), async (req, res) => {
  const { name, phone, email, address, notes } = req.body;
  const file = req.file;

  if (!/^((\+977)?98[0-9]{8})$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid Nepali phone number' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'sunarkrish882@gmail.com',
    subject: 'New Sketch Order Received',
    text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\nNotes: ${notes}`,
    attachments: file ? [{ path: file.path }] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Order submitted successfully!' });
  } catch (error) {
    console.error('Email failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
