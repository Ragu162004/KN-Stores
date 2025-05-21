import express from 'express';
import { sendContactEmail } from '../utils/nodeMailer.utils.js'; 

const contactRouter = express.Router();

contactRouter.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
  }

  try {
    await sendContactEmail(name, email, message, phone);

    res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

export default contactRouter;
