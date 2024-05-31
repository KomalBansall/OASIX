const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require('cors');
require('dotenv').config();//used to store sensitive information such as API keys, database passwords
const app = express();
app.use(cors())
app.use(express.json());

app.use(bodyParser.text({ type: 'text/xml' }));

const routes = require("./routes/index")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(routes);
app.use("/images", express.static("images"));

// const server = http.createServer(app);
// const io = socketIO(server);


// io.on('connection', (socket) => {
//   console.log('New client connected');
//   socket.on('socket_data', async (data) => {
//     console.log('Received data from client:', data);
//     try {
//       const ChatModel = require("./models/chat.model");
//       const chatMessage = new ChatModel({
//         sender: data.senderId,
//         receiver: data.receiverId,
//         message: data.message,
//       });
//       await ChatModel.save(chatMessage);
//     } catch (error) {
//     }
//     io.emit('socket_data', data);
//   });
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 7500 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Echo the message back to the client
    ws.send(`You said: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });                                                 
});

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,//which are used to avoid some deprecation warnings
    //.option is used to parse the MongoDB connection string using the MongoDB driver's new connection string parser.
    useUnifiedTopology: true, //option is used to enable the new Server Discovery and Monitoring engine in the MongoDB driver.
    // This engine provides improved performance and better handling of replica sets and sharded clusters. 
  }).then(() => {
    console.log("Database is connected sucessfully")
  })
  .catch((err) => {
    console.log("error", err.message)
  }
  );


const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});