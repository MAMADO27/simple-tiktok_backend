const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  const serverUrl = `http://localhost:${process.env.PORT || 9000}`;
  const testConversationId = process.env.TEST_CONVERSATION_ID || null;

  const testTokens = {
    ahmed: process.env.TEST_AHMED_TOKEN || "",
    sara: process.env.TEST_SARA_TOKEN || ""
  };

  res.json({ serverUrl, testTokens, testConversationId });
});

module.exports = router;
