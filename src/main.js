import TelegramApi from "node-telegram-bot-api";
import config from "config";
import { Calendar } from "telegram-inline-calendar";
import calendar from "./common/calendar.js";
import { getEvents } from "../src/services/getEventgoogleCal.service.js";
const bot = new TelegramApi(config.get("BOT_TOKEN"), { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Начальное приветствие" },
  { command: "/menu", description: "Меню" },
]);

const googleCalendar = new Calendar(bot, {
  date_format: "YYYY-MM-DD",
  language: "ru",
});

const dataGcalendar = {
  countPeople: "",
  text: "",
  timeStart: "",
  timeEnd: "",
  dateStart: "",
  dateEnd: "",
  msg: "",
};

function start() {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    // =============
    const res = await getEvents();
    const transformedArray = res.map((item) => {
      const [dateTime, title] = item.split(" - ");
      const [date, time] = dateTime.split("T");
      const utc = dateTime.slice(-6); // Extract the last 6 characters (UTC offset)

      return {
        date,
        time,
        utc,
        title,
      };
    });

    // transformedArray.forEach((el) => {
    //   // Получите текущую дату и время
    //   const now = new Date();
    //   // Преобразуйте дату и время события в объект Date
    //   const eventDateTime = new Date(`${el.date}T${el.time}`);

    //   // Вычислите разницу во времени между текущим временем и временем события
    //   const timeDifference = eventDateTime - now;

    //   // Установите интервал уведомления (15 min)
    //   const notificationInterval = 15 * 60 * 1000; // 15 min  в миллисекундах
    //   const before20secStartEvent = timeDifference - notificationInterval;

    //   // Если разница во времени меньше или равна интервалу уведомления, отправьте уведомление
    //   if (timeDifference > 0) {
    //     setTimeout(() => {
    //       const msg = `Уведомление: ${el.title} начнется через 15 минут!`;
    //       bot.sendMessage(chatId, msg);

    //       // Здесь можно добавить логику отправки уведомления в Telegram
    //     }, before20secStartEvent);
    //     console.log("Новый таймер установлен.");
    //   } else {
    //     clearTimeout();
    //   }
    // });

    bot.sendMessage(
      chatId,
      `Добро пожаловать в чат с ботом google calendar. С помощью этого бота вы можете с легкостью добавить событие в свой гугл календарь`
    );
  });
  bot.onText(/\/menu/, (msg) => {
    bot.sendMessage(msg.chat.id, `Меню бота`, {
      reply_markup: {
        keyboard: [
          ["Добавить событие", "Посмотреть все события"],
          ["❌ Закрыть меню"],
        ],
        resize_keyboard: true,
      },
    });
  });
  bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    return bot.sendMessage(chatId, `Тебя зовут ${msg.chat.first_name}`);
  });

  bot.onText(/\Добавить событие/, (msg) => {
    const chatId = msg.chat.id;
    try {
      calendar(bot, dataGcalendar, googleCalendar, msg, chatId);
      bot.on("callback_query", (query) => {
        let res;
        res = googleCalendar.clickButtonCalendar(query);

        if (res !== -1) {
          if (query.message.text === "Пожалуйста, выберите время:") {
            return (dataGcalendar.timeStart = query.data
              .trim()
              .replace(/[a-zа-яё]/gi, "")
              .slice(12, 17));
          }
          if (query.message.text === "Пожалуйста, выберите дату:") {
            return (dataGcalendar.dateStart = query.data
              .trim()
              .replace(/[a-zа-яё]/gi, "")
              .slice(1, 11));
          }

          return null;
        }
      });
      return bot.sendMessage(chatId, "введите описание события");
    } catch (error) {
      console.log(`ERROR MAIN.js: ${error}`);
    }
  });
  bot.onText(/\Закрыть меню/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Меню закрыто", {
      reply_markup: {
        remove_keyboard: true,
      },
    });
  });
  bot.onText(/\Посмотреть все события/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const res = await getEvents();

      if (typeof res === "object" && Array.isArray(res)) {
        // res - это массив

        res.forEach((el) => {
          const img =
            "https://cdn-edge.kwork.ru/pics/t3/67/24614417-63c2d92f0f6ba.jpg";
          // Извлечение даты (YYYY-MM-DD)
          const dateRegex = /\d{4}-\d{2}-\d{2}/;
          const extractedDate = el.match(dateRegex)[0];
          // Извлечение времени (HH:mm)
          const timeRegex = /\d{2}:\d{2}/;
          const extractedTime = el.match(timeRegex)[0];
          // Извлечение события (текст после времени и даты)
          const eventRegex = / - (.+)/;
          const extractedEvent = el.match(eventRegex)[1];
          const msg = `Дата: ${extractedDate} \nВремя ${extractedTime} \nСобытие: ${extractedEvent} \n  `;

          bot.sendPhoto(chatId, img, { caption: msg });
        });
      } else if (typeof res === "string") {
        // res - это строка
        bot.sendMessage(chatId, res);
      }
      // calendar(bot, dataGcalendar, googleCalendar, msg, chatId);
      // return bot.sendMessage(chatId, res);
    } catch (error) {
      console.log(`ERROR MAIN.js: ${error}`);
    }
  });
}

start();
