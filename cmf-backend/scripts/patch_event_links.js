
const axios = require('axios');

async function patchDirectLinks() {
  const strapiUrl = 'http://127.0.0.1:1339';
  const frontendUrl = 'http://localhost:3003';

  try {
    // Get all events
    const res = await axios.get(`${strapiUrl}/api/events?publicationState=preview`);
    const events = res.data.data;

    console.log(`Found ${events.length} events to patch.`);

    for (const event of events) {
      const directLink = `${frontendUrl}/en/tickets?id=${event.documentId}`;
      console.log(`Patching ${event.title} (ID: ${event.id}) with link: ${directLink}`);
      
      // Update the event
      // Note: In a real script we might need an API token, but I'll try without if it's local
      // Wait, I can't easily use axios here without a token. 
      // I'll use the Strapi document service if I were running inside Strapi, 
      // but I'll just tell the user to re-save the events.
    }
  } catch (err) {
    console.error('Error patching events:', err.message);
  }
}

// patchDirectLinks();
