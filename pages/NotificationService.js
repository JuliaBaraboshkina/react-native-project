import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import moment from 'moment';

class NotificationService {
  configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  scheduleNotification(task) {
    const deadline = moment(task.deadline);
    const reminderTime = deadline.subtract(1, 'days').toDate();

    PushNotification.localNotificationSchedule({
      channelId: 'default-channel-id', // for Android
      title: "Task Reminder",
      message: `You have a task due tomorrow: ${task.title}`,
      date: reminderTime,
      allowWhileIdle: true,
    });
  }
}

export default new NotificationService();
