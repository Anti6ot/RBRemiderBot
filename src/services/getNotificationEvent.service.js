export async function getNotificationEvents(
  bot,
  groupID,
  dataGcalendar,
  chatId
) {
  // Получите текущую дату и время
  const now = new Date();
  // Преобразуйте дату и время события в объект Date
  const eventDateTime = new Date(
    `${dataGcalendar.dateStart}T${dataGcalendar.timeStart}`
  );
  // Вычислите разницу во времени между текущим временем и временем события
  const timeDifference = eventDateTime - now;

  // Установите интервал уведомления (15 min)
  const notificationInterval = 15 * 60 * 1000; // 15 min  в миллисекундах
  const before20secStartEvent = timeDifference - notificationInterval;
  // Если разница во времени меньше или равна интервалу уведомления, отправьте уведомление
  if (timeDifference > 0) {
    const img =
      "https://cdn-edge.kwork.ru/pics/t3/67/24614417-63c2d92f0f6ba.jpg";
    setTimeout(() => {
      const message = `Уведомление:  Событие скоро начнется! \n  ${dataGcalendar.text}`;

      bot.sendPhoto(groupID, img, { caption: message });
      // Здесь можно добавить логику отправки уведомления в Telegram
    }, before20secStartEvent);
  } else {
    clearTimeout();
  }
  // ========================
  bot.sendMessage(chatId, "Событие было добавленно");
}
