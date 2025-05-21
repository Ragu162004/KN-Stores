// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOrderConfirmationEmail = async (to, order) => {
    const productList = order.items
        .map(
            (item, index) =>
                `${index + 1}. ${item.quantity}x ${item.product.name} - ₹${item.product.offerPrice}`
        )
        .join("<br>");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Confirmation - ${order._id}`,
        html: `
      <h2>Thank you for your order!</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Payment Method:</strong> ${order.paymentType}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p><strong>Products:</strong></p>
      <p>${productList}</p>
      <p><strong>Total Amount:</strong> ₹${order.amount}</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendOrderCancellationEmail = async (to, order) => {
    const productList = order.items
        .map(
            (item, index) =>
                `${index + 1}. ${item.quantity}x ${item.product.name} - ₹${item.product.offerPrice}`
        )
        .join("<br>");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Cancelled - ${order._id}`,
        html: `
      <h2>Your order has been cancelled</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Cancelled Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Products:</strong></p>
      <p>${productList}</p>
      <p><strong>Total Amount:</strong> ₹${order.amount}</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendOrderDeliveryEmail = async (to, order) => {
    const productList = order.items
        .map(
            (item, index) =>
                `${index + 1}. ${item.quantity}x ${item.product.name} - ₹${item.product.offerPrice}`
        )
        .join("<br>");

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Delivered - ${order._id}`,
        html: `
      <h2>Your order has been delivered successfully!</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Delivered Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Products:</strong></p>
      <p>${productList}</p>
      <p><strong>Total Paid:</strong> ₹${order.amount}</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendContactEmail = async (name, email, message, phone = 'N/A') => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "ragu16102004@gmail.com",
        subject: `Contact Request from ${name}`,
        html: `
      <h3>New Message from KN Stores Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
    };

    await transporter.sendMail(mailOptions);

    const autoReply = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "We've received your message - KN Stores",
        html: `
    <h3>Hi ${name},</h3>
    <p>Thank you for contacting KN Stores. We've received your message and will get back to you shortly.</p>
    <p><strong>Your Message:</strong><br>${message}</p>
    <br>
    <p>Best regards,<br>KN Stores Team</p>
  `,
    };
    await transporter.sendMail(autoReply);

};
