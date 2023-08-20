const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Weatherstack API 키와 Telegram 봇 토큰을 설정합니다.
const weatherstackApiKey = '';
const telegramBotToken = '';

// 대한민국의 도시 목록을 가져옵니다.
const koreanCities = [
  'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Suwon', 'Bucheon', 'Jeonju', // 여기에 추가
];

// Telegram 봇을 생성합니다.
const bot = new TelegramBot(telegramBotToken, { polling: true });

// 날씨 정보를 가져오는 함수를 정의합니다.
async function getWeather(city) {
  try {
    // 추가한 파라미터 include에 'precip'를 추가하여 강수 정보를 가져옵니다.
    const response = await axios.get(`http://api.weatherstack.com/current?access_key=${weatherstackApiKey}&query=${city}&include=precip`);
    const weatherData = response.data.current;
    return weatherData;
  } catch (error) {
    throw error;
  }
}

// 사용자에게 도시 목록을 보여주는 함수를 정의합니다.
function showCityList(chatId) {
  const citiesKeyboard = {
    reply_markup: {
      keyboard: koreanCities.map(city => [{ text: city }]),
      one_time_keyboard: true,
    },
  };

  bot.sendMessage(chatId, '원하는 도시를 선택하세요:', citiesKeyboard);
}

// Telegram 봇 명령어를 처리합니다.
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  showCityList(chatId);
});

// 사용자가 도시를 선택할 때의 동작을 처리합니다.
bot.onText(/(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const selectedCity = match[1];

  if (koreanCities.includes(selectedCity)) {
    try {
      const weatherData = await getWeather(selectedCity);
      // 추가한 강수 확률 정보를 포함하여 메시지를 보냅니다.
      bot.sendMessage(chatId, `${selectedCity}의 날씨 정보:\n온도: ${weatherData.temperature}°C\n습도: ${weatherData.humidity}%\n날씨: ${weatherData.weather_descriptions[0]}\n강수 확률: ${weatherData.precip}%`);
    } catch (error) {
      bot.sendMessage(chatId, '날씨 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }
});
