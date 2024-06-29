const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data')
const axios = require('axios')
const app = express();
const fs = require('fs')
const port = 80
const accountSid = 'ACe11cad3ef07746029a0997736a5035b8';
const authToken = 'cdfcdcbca624d98a44f4e494f4bee474';
const from_phonenumber = "+18447556831"
const client = require('twilio')(accountSid, authToken);

async function sendSMS(to, message) {
    try {
        const result = await client.messages.create({
            body: message,
            from: from_phonenumber,
            to: to
        });
        console.log('Message sent successfully. SID:', result.sid);
        return result.sid;
    } catch (error) {
        console.error('Error sending SMS:');
        // throw error;
    }
}

async function sendEmail(to, subject, text) {
  // Create a transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, 
    secure: false,
    auth: {
      user: 'benefitactivation@gmail.com',
      pass: 'mrtngbyipcwnozjy',
    },
  });

  const mailOptions = {
    from: 'benefitactivation@gmail.com', 
    to,
    subject, 
        html: text, 

    
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: 'Error sending email' };
  }
}

app.use(cors());
app.use(bodyParser.json());
app.get('/ailplus', (req, res) => {
    let absolutePath = path.join(__dirname, '/pages/ailplus.html');
    res.sendFile(absolutePath);
  })
  app.get('/', (req, res) => {
    let absolutePath = path.join(__dirname, '/pages/ailplus.html');
    res.sendFile(absolutePath);
  })
app.get('/thanks',(req,res)=>{
  let absolutePath = path.join(__dirname,'pages/childsafekit-thanks.html')
  res.sendFile(absolutePath)
})
app.get('/user', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      const users = Object.values(jsonData);

      if (users.length === 0) {
        res.status(404).send('No users found');
      } else {
        const lastUser = users[users.length - 1];
        console.log(lastUser)
        res.json(lastUser);
      }
    } catch (parseError) {
      console.error(parseError);
      res.status(500).send('Error parsing JSON');
    }
  });
});
  app.get('/data', async (req, res) => {
    try {
      // Replace 'YOUR_API_URL' and 'YOUR_AUTH_TOKEN' with the actual URL and token
      const apiUrl = 'https://aileadtransfer.com/api/calendar';
      const authToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiVGVzdCB1c2VyIiwibmFtZSI6IlRlc3QgdXNlciIsInBhc3N3b3JkIjpudWxsLCJBUElfVElNRSI6MTY5ODY2ODA4MH0.r2d9VgVbMe3-JaAfRlkXMN_llNsG3lSqxvSgFgeK53w';
  
      const response = await axios.get(apiUrl, {
        headers: {
          "authtoken" : `${authToken}`
        }
      });
  
      
      const jsonData = response.data;
  
      // Assuming jsonData is an array of events
      res.json(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.post('/bot', async (req, res) => {
      // Assuming the received data is a JSON object
      const receivedData = req.body;
      console.log(receivedData)
      // Read existing data from data.json (if any)
      let existingData = [];
      try {
        const dataFile = fs.readFileSync('data.json', 'utf8');
        existingData = JSON.parse(dataFile);
      } catch (error) {
        // If the file doesn't exist or is not valid JSON, ignore and start with an empty array
        console.log(error)
        // res.status(500).send(error)
      }
    
      // Add the received data to the existing data array
      existingData[receivedData['name']] = receivedData
      // console.log(existingData)
      // Write the updated data array back to data.json
      fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2), 'utf8');
    
      res.status(200).send('Data received and stored successfully.');
    });
    app.get('/bot',(req,res)=>{
      let absolutePath = path.join(__dirname,'/pages/ailplus_bot.html')
      res.sendFile(absolutePath)
    })


    app.post('/email', async (req, res) => {
      const requestData = req.body;
      const platform = requestData['platform'];
      const email = requestData['email'];
      const name = requestData['name'];
      const zoom_link = requestData['link'];
      const phonenumber = requestData['phonenumber'];
      // const address = requestData['address'];
      let agent_name = "Anthony";
      let agent_phone_number = "4079212467";
      const time = requestData['time'];
  
      try {
          // Sending email
          let emailText = `
              <img src="https://aileadtransfers.com/ADS/Images/jobs.jpg" alt="Logo">
              <h1>This is to present to you the AIEAP Health Discount Program, AIL Plus.</h1>
              <p>I will be texting you until the meeting to be sure it goes off without a hitch.  We all lead such busy lives that we try and assist people in completing the important appointment they have setup. 
  
              Just so you know ${agent_name}  is one of the Advisors who is high in demand because of her dedication to following through with her appointments.
  
              The Zoom link - ${zoom_link}
  
              This is her cell number in case of emergency - ${agent_phone_number}
  
              Please text back a C to confirm your attendance at this appointment.
              `;
  
          await sendEmail(email, "Confirmation | AILPLUS", emailText);
  
          // Sending SMS
          await sendSMS(phonenumber, emailText);
  
          // Adding lead to CRM
          let data2 = new FormData();
          data2.append('name', "ailplus");
          data2.append('source', "13");
          data2.append('status', "8");
          data2.append("title", "ailplus Meeting");
          // data2.append('assigned', '35');
          data2.append('client_id', "0");
  
          let config = {
              method: 'post',
              maxBodyLength: Infinity,
              url: 'http://aileadtransfer.com/api/leads',
              headers: {
                  'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiVGVzdCB1c2VyIiwibmFtZSI6IlRlc3QgdXNlciIsInBhc3N3b3JkIjpudWxsLCJBUElfVElNRSI6MTY5ODY2ODA4MH0.r2d9VgVbMe3-JaAfRlkXMN_llNsG3lSqxvSgFgeK53w',
                  'Cookie': 'csrf_cookie_name=ed67552cee6b74b726acb03704571d95; sp_session=b08c5d39e6d27f448d6c182d472e7424946f9df8',
                  ...data2.getHeaders()
              },
              data: data2
          };
  
          await axios.request(config);
  
          // Responding to client
          res.json({ message: 'Email sent and SMS sent successfully', data: requestData });
      } catch (error) {
          console.error('Error processing request:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });
  


    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
      