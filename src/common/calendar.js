import { getNotificationEvents } from "../services/getNotificationEvent.service.js";
import { run } from "../services/googleCalendar.service.js";
import config from "config";

export default function calendar(bot, dataGcalendar, gglClndr, msg, chatId) {
  const groupID = config.get("TELEGRAM_GROUP_ID");
  gglClndr.startNavCalendar(msg); //Инлайн клавиатура календаря в чате
  gglClndr.startTimeSelector(msg); //инлайн клавиатура установки времени

  function proverka(msg) {
    dataGcalendar.text = msg.text;
    run(dataGcalendar);
    // ========================
    const message = `Уведомление:  Записаться на событие! \n  ${dataGcalendar.text} \n "https://cdn-edge.kwork.ru/pics/t3/67/24614417-63c2d92f0f6ba.jpg"`;
    getNotificationEvents(bot, groupID, dataGcalendar, chatId);
    bot.sendMessage(groupID, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Иду!", callback_data: "go" },
            { text: "Не пойду", callback_data: "cancel" },
            { text: "Резерв", callback_data: "reserve" },
          ],
        ],
      },
    });

    bot.on("callback_query", (query) => {
      const data = query.data; // Получаем callback data

      switch (data) {
        case "go":
          bot.sendMessage(
            chatId,
            `Пользователь ${query.from.first_name} выбрал идти`
          );
          // Дополнительные действия при выборе "Иду!"
          break;
        case "cancel":
          bot.sendMessage(
            chatId,
            `Пользователь ${query.from.first_name} выбрал не идти`
          );
          // Дополнительные действия при выборе "Не пойду"
          break;
        case "reserve":
          bot.sendMessage(
            chatId,
            `Пользователь ${query.from.first_name} выбрал резерв`
          );
          // Дополнительные действия при выборе "Резерв"
          break;
        default:
          bot.sendMessage(chatId, "Неизвестное действие");
          break;
      }
    });
    bot.removeListener("message", proverka);
  }

  bot.on("message", proverka);
}
