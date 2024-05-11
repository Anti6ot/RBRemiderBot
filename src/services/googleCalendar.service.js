import config from "config";
import { google } from "googleapis";

const SCOPE_CALENDAR = "https://www.googleapis.com/auth/calendar"; // authorization scopes
const SCOPE_EVENTS = "https://www.googleapis.com/auth/calendar.events";

export async function run({ dateStart, timeStart, dateEnd, text, h1 }) {
  const parse = Date.parse(`${dateStart} ${timeStart}:00 GMT`) + 10000000; // парсит дату и добавляет 2 с половиной часа
  let lastEndDate = JSON.stringify(new Date(parse)).slice(1, 20);

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

  async function createEvent(auth) {
    const event = {
      summary: "Телеграмм бот",
      description: text || "not writing",
      start: {
        dateTime: `${dateStart}T${timeStart}:00+05:00`,
        timeZone: "Asia/Yekaterinburg",
      },
      end: {
        dateTime: `${lastEndDate}+05:00`,
        timeZone: "Asia/Yekaterinburg",
      },
    };

    let calendar = google.calendar("v3");
    calendar.events.insert({
      auth: auth,
      calendarId: config.get("CALENDAR_ID"),
      resource: event,
    });
  }

  // MAIN
  try {
    const auth = await authenticate(config);
    createEvent(auth);
  } catch (e) {
    console.log("Error: " + e);
  }
}
