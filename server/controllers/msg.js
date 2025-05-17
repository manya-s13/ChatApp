import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;

    const sender = req.user?.id;

    console.log("Sender:", sender);
    console.log("Receiver:", receiver);
    console.log("Content:", content);

    if (!sender) {
      return res.status(401).json({ error: "Unauthorized: Sender not found in token" });
    }

    if (!receiver || !content) {
      return res.status(400).json({ error: "Receiver and content are required." });
    }

    const message = new Message({ sender, receiver, content });
    const savedMessage = await message.save();

    try {
      const io = req.app.get('io');
      if (io) {
        io.to(receiver).emit('newMessage', savedMessage);
      }
    } catch (socketError) {
      console.error("Socket.io error:", socketError);
      // Continue execution even if socket emission fails
    }
    
    res.status(201).json({
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Message sending failed:", error);
    res.status(500).json({ 
      error: "Message sending failed", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
  };
  
  export const getMessages = async (req, res) => {
    const { user1, user2 } = req.params;
    try {
      const messages = await Message.find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 },
        ],
      }).sort({ timestamp: 1 });
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Fetching messages failed" });
    }
  };