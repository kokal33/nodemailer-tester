require('dotenv').config();
const nodemailer = require('nodemailer');
const readline = require('readline');

// Configure your transporter with your SMTP details for sending emails
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

// In-memory queue
const emailQueue = [];

// Generate a list of dummy recipients using Mailtrap domain
const generateDummyEmails = (count) => {
    const dummyEmails = [];
    for (let i = 1; i <= count; i++) {
        dummyEmails.push(`recipient${i}@sandbox.smtp.mailtrap.io`); // Use Mailtrap domain for recipients
    }
    console.log(`Generated ${count} dummy emails`);
    return dummyEmails;
};

const recipients = generateDummyEmails(500); // Change the number as needed

// Add jobs to the in-memory queue
recipients.forEach(recipient => {
    emailQueue.push({ recipient });
});

console.log('Added email jobs to the queue');

// Function to send an email
const sendEmail = async (recipient) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Bulk Email Test',
        text: 'This is a test email sent in bulk.'
    };

    return transporter.sendMail(mailOptions);
};

// Process email jobs from the in-memory queue
const processQueue = async () => {
    if (emailQueue.length === 0) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        console.log('Finished processing all jobs in the queue');
        clearInterval(queueInterval); // Clear the interval once the queue is empty
        return;
    }

    const job = emailQueue.shift();
    try {
        await sendEmail(job.recipient);
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(`Email sent to: ${job.recipient}`);
    } catch (error) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(`Failed to send email to ${job.recipient}: ${error.message}`);
    }
};

// Set an interval to process the queue based on the environment variable
const queueInterval = setInterval(processQueue, parseInt(process.env.QUEUE_INTERVAL, 10));

console.log('Queue processing started');
