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
// const from_phonenumber = ""
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
        console.error('Error sending SMS:', error);
        throw error;
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
  html: text ,// This is where you include your HTML content
    
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
app.get('/',(req,res)=>{
  let absolutePath = path.join(__dirname, '/pages/jobs.html');
  res.sendFile(absolutePath);
})
app.use(cors());
app.use(bodyParser.json());
app.get('/jobs', (req, res) => {
  let absolutePath = path.join(__dirname, '/pages/jobs.html');
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
    
      // Write the updated data array back to data.json
      fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2), 'utf8');
    
      res.status(200).send('Data received and stored successfully.');
    });
    app.get('/bot',(req,res)=>{
      let absolutePath = path.join(__dirname,'/pages/jobs_bot.html')
      res.sendFile(absolutePath)
    })


    app.post('/email', (req, res) => {
      const requestData = req.body;
      const platform = requestData['platform']
      const email = requestData['email']
      const name = requestData['name']
      const zoom_link = requestData['link']
      const phonenumber = requestData['phonenumber']
      const address = requestData['address']
      let agent_name = "Anthony"
      let agent_phone_number = "4079212467"
      const time = requestData['time']
        let data2 = new FormData
        data2.append('name',"jobs")
        data2.append('source',"13")
        data2.append('status',"8")
        data2.append("title","jobs Meeting")
        data2.append('assigned','35')
        data2.append('client_id',"0")
        // data2.append('email',email)
        // data2.append('phonenumber',phonenumber)
        // data2.append('address',address)
        // data2.append("city",requestData['city'])
        // data2.append("country",requestData['country'])
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
        
        axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
        // addLeadToCRM(data2)
        let emailText = `
        <html>
            <head>
                <style>
                    /* Add CSS styles here if needed */
                </style>
            </head>
            <body>
                <img src="https://aileadtransfers.com/ADS/Images/childsafetykit.jpg" alt="Logo">
                <h1>This is to present to you the AIECS No Cost Child Id Kit</h1>
                <p>I will be texting you until the meeting to be sure it goes off without a hitch. We all lead such busy lives that we try and assist people in completing the important appointment they have setup.</p>
                <p>Just so you know Anthony is one of the Advisors who is high in demand because of her dedication to following through with her appointments.</p>
                <p>The Zoom link - <a href="${zoom_link}">${zoom_link}</a></p>
                <p>This is her cell number in case of emergency - 4079212467</p>
                <p>Please text back a C to confirm your attendance at this appointment.</p>
            </body>
        </html>
    `;
        sendEmail(email, "Confirmation | Jobs Recuirement", emailText);
          
        sendSMS(phonenumber, emailText)
.then(sid => console.log('Message SID:', sid))
.catch(err => console.error('Failed to send message:', err));
      res.json({ message: 'Endpoint 1 POST request received', data: requestData });
    });


    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
      