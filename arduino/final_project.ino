#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "UUMWiFi_Guest";

#define DHTPIN  4          // Pin connected to the DHT22 sensor
#define DHTTYPE DHT22      // DHT 22  (AM2302)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Define the LDR sensor pin
const int LDR_PIN = 34;

// Define the LED pin
const int LED_PIN = 32;

// Define the servo pin
const int SERVO_PIN = 33;
Servo myServo;  // Create a servo object

// Telegram bot credentials
const char* telegramBotToken = "7492279353:AAEvx3Pwv7L6kFljiUHdOSgl0t8mxkS6AJk";
const char* telegramChatID = "855004212";

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Set the LED pin as output
  pinMode(LED_PIN, OUTPUT);

  // Attach the servo motor to the specified pin
  myServo.attach(SERVO_PIN);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
}

void sendTelegramMessage(String message) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String("https://api.telegram.org/bot") + telegramBotToken + "/sendMessage?chat_id=" + telegramChatID + "&text=" + message;
    http.begin(url);
    int httpResponseCode = http.GET();
    if(httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending GET: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

void loop() {
  // Read sensor data
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int lightIntensity = analogRead(LDR_PIN);

  // Check if readings are valid
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Print sensor data
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" °C, Humidity: ");
  Serial.print(humidity);
  Serial.print(" %, Light Intensity: ");
  Serial.println(lightIntensity);

  // Send Telegram notification if temperature exceeds 40°C
  if (temperature >= 40) {
    sendTelegramMessage("Alert: Temperature has reached " + String(temperature) + " °C! Are you in Sahara desert?");
  }

  // Control LED brightness based on light intensity
  int ledBrightness = 0;
  if (lightIntensity >= 0 && lightIntensity <= 100) {
    ledBrightness = map(lightIntensity, 0, 100, 255, 0); // Inverted mapping for the range 0-100
  }
  analogWrite(LED_PIN, ledBrightness);

  // Fetch average humidity from Next.js website
  float avgHumidity = fetchAverageHumidity();
  Serial.print("Average Humidity: ");
  Serial.println(avgHumidity);

    // Control servo motor based on average humidity
  if (avgHumidity >= 90) {
    myServo.write(180);  // Turn servo to 180 degrees
    delay(500);  // Wait for the servo to move
    Serial.println("Servo turned on");
  } else if (avgHumidity > 0 && avgHumidity < 90) {
    myServo.write(90);  // Turn servo to 0 degrees
    delay(500);  // Wait for the servo to move
    Serial.println("Servo turned off");
  } else {
    Serial.println("Invalid average humidity value received, skipping servo control");
  }


  // Send data to the server
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://104.248.152.28/insert_data.php");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String httpRequestData = "temperature=" + String(temperature) + "&humidity=" + String(humidity) + "&light_intensity=" + String(lightIntensity);
    int httpResponseCode = http.POST(httpRequestData);

    if(httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // Wait for 10 seconds before the next reading
  delay(10000);
}

float fetchAverageHumidity() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("https://temperature-humidity-light-intensity-in-real-time-using-esp32.vercel.app/api/averageHumidity");
    int httpResponseCode = http.GET();
    float avgHumidity = 0;
    if(httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);
      if (!error) {
        avgHumidity = doc["avgHumidity"].as<float>();
        Serial.println(httpResponseCode);
        Serial.println(response);
      } else {
        Serial.print("Error parsing JSON: ");
        Serial.println(error.c_str());
      }
    } else {
      Serial.print("Error on fetching average humidity: ");
      Serial.println(httpResponseCode);
    }
    http.end();
    return avgHumidity;
  } else {
    Serial.println("WiFi Disconnected");
    return -1;
  }
}
