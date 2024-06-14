#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "abeeim_2.4GHz";
const char* password = "mib0193192987";

#define DHTPIN  4          // Pin connected to the DHT22 sensor
#define DHTTYPE DHT22      // DHT 22  (AM2302)

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Define the LDR sensor pin
const int LDR_PIN = 34;

// Define the LED pin
const int LED_PIN = 32;

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Set the LED pin as output
  pinMode(LED_PIN, OUTPUT);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
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

  // Control LED brightness based on light intensity
  int ledBrightness = map(lightIntensity, 0, 4095, 0, 255);
  analogWrite(LED_PIN, ledBrightness);

  // Send data to the server
  if(WiFi.status()== WL_CONNECTED){
    HTTPClient http;
    http.begin("http://104.248.152.28/insert_data.php");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String httpRequestData = "temperature=" + String(temperature) + "&humidity=" + String(humidity) + "&light_intensity=" + String(lightIntensity);
    int httpResponseCode = http.POST(httpRequestData);

    if(httpResponseCode>0){
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    }else{
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }else{
    Serial.println("WiFi Disconnected");
  }

  // Wait for 10 seconds before the next reading
  delay(10000);
}
