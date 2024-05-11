import config from "config";
import { google } from "googleapis";

const SCOPE_CALENDAR = "https://www.googleapis.com/auth/calendar"; // authorization scopes
const SCOPE_EVENTS = "https://www.googleapis.com/auth/calendar.events";

export async function getEvents() {
  try {
    async function geteventall(auth) {
      // Получите предстоящие события
      let calendar = google.calendar("v3");
      const res = await calendar.events.list({
        auth: auth,
        calendarId: config.get("CALENDAR_ID"),
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = res.data.items;
      if (events.length) {
        const eventsText = events.map((event) => {
          const start = event.start.dateTime || event.start.date;
          return `${start} - ${event.description}`;
        });

        return eventsText;
      } else {
        return "Нет предстоящих событий.";
      }
    }
    async function authenticate(key) {
      const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        [SCOPE_CALENDAR, SCOPE_EVENTS]
      );
      await jwtClient.authorize();
      return jwtClient;
    }
    const auth = await authenticate(config);
    const eventData = await geteventall(auth); // Получите данные о событиях

    return eventData;
  } catch (e) {
    console.log("Error: " + e);
  }
}
