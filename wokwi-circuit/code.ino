/*
 * HỆ THỐNG XÁC THỰC 2FA RFID + OTP
 * Đơn giản hóa - Tập trung vào ứng dụng thực tế
 * Use cases: Chấm công, Thang máy, Cửa ra vào
 */

 #include <Wire.h>
 #include <Adafruit_GFX.h>
 #include <Adafruit_SSD1306.h>
 #include <WiFi.h>
 #include <HTTPClient.h>
 #include <limits.h>  // Cho ULONG_MAX
 
 // ========== PIN CONFIGURATION ==========
 #define OLED_SDA 21
 #define OLED_SCL 22
 #define RELAY_PIN 17
 #define LED_GREEN 2
 #define LED_RED 4
 #define BUZZER_PIN 25
 
 // ========== OLED DISPLAY ==========
 #define SCREEN_WIDTH 128
 #define SCREEN_HEIGHT 64
 Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
 
 // ========== USE CASE MODE ==========
 enum UseCase {
   TIME_CLOCK,      // Chấm công
   ELEVATOR,        // Thang máy
   DOOR_ACCESS      // Cửa ra vào
 };
 
 UseCase currentUseCase = TIME_CLOCK; // Mặc định: Chấm công
 
 // ========== WIFI CONFIG ==========
 const char* ssid = "Wokwi-GUEST";  // Wokwi simulation WiFi
 const char* password = "";
 const char* serverURL = "https://esp322fa.onrender.com";  // Backend deployed on Render
 
 // ========== RFID DATABASE ==========
 String validCards[] = {"A1B2C3D4", "E5F6G7H8", "I9J0K1L2"};
 String userNames[] = {"NGUYEN TIEN DAT", "NGUYEN SI DUY", "NGUYEN VAN A"};
 String userEmails[] = {"dattkdz@gmail.com", "duy@company.com", "vana@company.com"};
 int numCards = 3;
 
 // ========== STATE VARIABLES ==========
 String currentRFID = "";
 String currentOTPCode = "";
 String sessionToken = "";
 bool waitingForOTP = false;
 int otpAttempts = 0;
 const int MAX_OTP_ATTEMPTS = 3;
 unsigned long lastCardRead = 0;
 
 // ========== TIME CLOCK COOLDOWN ==========
 struct TimeClockRecord {
   String rfid_uid;
   unsigned long lastClockTime;  // Thời gian chấm công cuối cùng
 };
 
 TimeClockRecord timeClockRecords[10]; // Lưu 10 card gần nhất
 int timeClockRecordCount = 0;
 const unsigned long TIME_CLOCK_COOLDOWN = 60000; // 60 giây (60000 milliseconds)
 
 // ========== ACCESS LOG ==========
 struct AccessLog {
   String userName;
   String rfid_uid;
   String timestamp;
   bool success;
 };
 
 AccessLog accessLogs[20];
 int logCount = 0;
 
 // ========== SETUP ==========
 void setup() {
   Serial.begin(115200);
   
   // GPIO Setup
   pinMode(RELAY_PIN, OUTPUT);
   pinMode(LED_GREEN, OUTPUT);
   pinMode(LED_RED, OUTPUT);
   pinMode(BUZZER_PIN, OUTPUT);
   digitalWrite(RELAY_PIN, LOW);
   digitalWrite(LED_GREEN, LOW);
   digitalWrite(LED_RED, HIGH);
   
   // OLED Init
   if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
     Serial.println("OLED init failed!");
   }
   
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   display.setCursor(0, 0);
   display.println("Initializing...");
   display.display();
   
   // Kết nối WiFi để gửi OTP qua email
   connectToWiFi();
   
   // Hiển thị màn hình chờ
   displayWelcome();
   
   Serial.println("========================================");
   Serial.println("2FA System Ready!");
   Serial.println("========================================");
   Serial.println("Use Cases:");
   Serial.println("  1. TIME_CLOCK - Chấm công");
   Serial.println("  2. ELEVATOR - Thang máy");
   Serial.println("  3. DOOR_ACCESS - Cửa ra vào");
   Serial.println("========================================");
   Serial.println("Nhap RFID UID:");
   Serial.println("  - A1B2C3D4 (NGUYEN TIEN DAT)");
   Serial.println("  - E5F6G7H8 (NGUYEN SI DUY)");
   Serial.println("  - I9J0K1L2 (NGUYEN VAN A)");
   Serial.println("========================================");
 }
 
 // ========== MAIN LOOP ==========
 void loop() {
   // Đọc input từ Serial Monitor
   if (Serial.available() > 0) {
     String input = Serial.readStringUntil('\n');
     input.trim();
     input.toUpperCase();
     
     // Kiểm tra OTP code (6 chữ số)
     if (input.length() == 6 && isDigit(input[0])) {
       if (waitingForOTP && !currentRFID.isEmpty()) {
         // Chỉ verify OTP nếu đang chờ và có RFID
         verifyOTP(input);
       } else {
         Serial.println(">>> Chua quet the RFID!");
         Serial.println(">>> Vui long quet the RFID truoc khi nhap OTP");
       }
     }
     // Kiểm tra RFID UID
     else if (input.length() >= 4 && input.length() <= 16) {
       if (input != currentRFID && (millis() - lastCardRead > 2000)) {
         currentRFID = input;
         lastCardRead = millis();
         Serial.println("\n>>> RFID Card: " + currentRFID);
         handleRFIDCard(currentRFID);
       }
     }
     // Commands
     else if (input == "CLOCK" || input == "1") {
       currentUseCase = TIME_CLOCK;
       displayWelcome();
       Serial.println(">>> Mode: CHAM CONG (Time Clock)");
     } else if (input == "ELEVATOR" || input == "2") {
       currentUseCase = ELEVATOR;
       displayWelcome();
       Serial.println(">>> Mode: THANG MAY (Elevator)");
     } else if (input == "DOOR" || input == "3") {
       currentUseCase = DOOR_ACCESS;
       displayWelcome();
       Serial.println(">>> Mode: CUA RA VAO (Door Access)");
     }
   }
   
   delay(100);
 }
 
 // ========== HANDLE RFID CARD ==========
 void handleRFIDCard(String cardUID) {
   // Tìm user
   int userIndex = -1;
   for (int i = 0; i < numCards; i++) {
     if (validCards[i] == cardUID) {
       userIndex = i;
       break;
     }
   }
   
  if (userIndex == -1) {
    displayError("Card khong hop le!");
    Serial.println(">>> ACCESS DENIED: Card not found");
    
    // Bật LED đỏ khi access denied
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
    
    // Gửi log thất bại lên server
    sendLogToServer(cardUID, "Unknown", false);
    
    beep(3);
    delay(2000);
    digitalWrite(LED_RED, LOW);
    displayWelcome();
    return;
  }
   
   // Kiểm tra cooldown cho TIME_CLOCK mode
   if (currentUseCase == TIME_CLOCK) {
     unsigned long lastClockTime = getLastClockTime(cardUID);
     unsigned long currentTime = millis();
     
     if (lastClockTime > 0) {
       // Xử lý overflow của millis()
       unsigned long timeSinceLastClock;
       if (currentTime >= lastClockTime) {
         timeSinceLastClock = currentTime - lastClockTime;
       } else {
         // millis() đã overflow
         timeSinceLastClock = (ULONG_MAX - lastClockTime) + currentTime;
       }
       
       if (timeSinceLastClock < TIME_CLOCK_COOLDOWN) {
         // Card này đã chấm công trong 60s gần đây
         int remainingSeconds = (TIME_CLOCK_COOLDOWN - timeSinceLastClock) / 1000;
         int remainingMs = (TIME_CLOCK_COOLDOWN - timeSinceLastClock) % 1000;
         
        displayError("Cham cong qua som!");
        Serial.println(">>> ========================================");
        Serial.println(">>> CHAM CONG BI CHAN!");
        Serial.println(">>> Card: " + cardUID);
        Serial.println(">>> Con " + String(remainingSeconds) + " giay " + String(remainingMs) + "ms nua");
        Serial.println(">>> Ban co the dung card khac de cham cong");
        Serial.println(">>> ========================================");
        
        // Bật LED đỏ khi chấm công quá sớm
        digitalWrite(LED_RED, HIGH);
        digitalWrite(LED_GREEN, LOW);
        
        beep(3);
        delay(3000);
        digitalWrite(LED_RED, LOW);
        displayWelcome();
        return;
       }
     }
   }
   
   // Hiển thị thông tin user
   String userName = userNames[userIndex];
   String userEmail = userEmails[userIndex];
   
   // Hiển thị loading animation khi quét RFID
   displayLoading("Dang xu ly...", 0);
   
   // Tạo OTP và gửi qua email (qua server)
   currentOTPCode = generateOTP();
   sessionToken = "session_" + String(millis());
   waitingForOTP = true;
   otpAttempts = 0;
   
   // Loading: Gửi OTP qua email (qua server)
   displayLoading("Gui OTP...", 30);
   sendOTPToEmail(cardUID, userName, userEmail);
   
   // Loading: Hoàn thành
   displayLoading("Hoan thanh!", 100);
   delay(500);
   
   // Hiển thị màn hình yêu cầu OTP
   displayOTPRequest(userName, userEmail, currentOTPCode);
   
   Serial.println(">>> ========================================");
   Serial.println(">>> User: " + userName);
   Serial.println(">>> Email: " + userEmail);
   Serial.println(">>> OTP Code: " + currentOTPCode);
   Serial.println(">>> OTP da gui den email: " + userEmail);
   Serial.println(">>> Kiem tra email de lay OTP!");
   Serial.println(">>> Nhap OTP code (6 chu so):");
   Serial.println(">>> ========================================");
 }
 
 // ========== VERIFY OTP ==========
 void verifyOTP(String otpInput) {
   // Kiểm tra xem đang chờ OTP không
   if (!waitingForOTP || currentRFID.isEmpty()) {
     Serial.println(">>> ⚠️ Chua co session OTP. Vui long quet the RFID truoc!");
     return;
   }
   
   otpAttempts++;
   
   Serial.println(">>> ========================================");
   Serial.println(">>> XAC THUC OTP - Lan thu " + String(otpAttempts) + "/" + String(MAX_OTP_ATTEMPTS));
   Serial.println(">>> OTP nhap vao: " + otpInput);
   Serial.println(">>> OTP dung: " + currentOTPCode);
   
   // Kiểm tra OTP
   bool otpCorrect = (otpInput == currentOTPCode || otpInput == "123456"); // 123456 = demo code
   
   if (otpCorrect) {
     // OTP ĐÚNG - Cho phép truy cập
     Serial.println(">>> ✓✓✓ OTP DUNG! Cho phep truy cap...");
     Serial.println(">>> ========================================");
     waitingForOTP = false; // Ngăn verify nhiều lần
     grantAccess();
   } else {
     // OTP SAI
     Serial.println(">>> ✗✗✗ OTP SAI!");
     Serial.println(">>> Con " + String(MAX_OTP_ATTEMPTS - otpAttempts) + " lan thu nua");
     Serial.println(">>> ========================================");
     
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
      // Quá số lần thử - TỪ CHỐI truy cập
      displayError("Qua so lan thu!");
      Serial.println(">>> ========================================");
      Serial.println(">>> ACCESS DENIED: Too many failed attempts");
      Serial.println(">>> Ban da nhap sai OTP " + String(MAX_OTP_ATTEMPTS) + " lan!");
      Serial.println(">>> Vui long quet lai the RFID");
      Serial.println(">>> ========================================");
      
      // Bật LED đỏ khi access denied
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_GREEN, LOW);
      
      beep(5);
      delay(3000);
      digitalWrite(LED_RED, LOW);
      resetState();
    } else {
      // Còn cơ hội thử lại
      displayError("OTP sai! Thu lai...");
      
      // Nhấp nháy LED đỏ khi OTP sai
      digitalWrite(LED_RED, HIGH);
      digitalWrite(LED_GREEN, LOW);
      beep(2);
      delay(1000);
      digitalWrite(LED_RED, LOW);
      delay(1000);
      
      displayOTPRequest(userNames[findUserIndex(currentRFID)], userEmails[findUserIndex(currentRFID)], currentOTPCode);
    }
   }
 }
 
 // ========== GRANT ACCESS ==========
 void grantAccess() {
   // Kiểm tra xem có RFID không
   if (currentRFID.isEmpty()) {
     Serial.println(">>> ⚠️ Khong co RFID card!");
     return;
   }
   
   int userIndex = findUserIndex(currentRFID);
   if (userIndex < 0) {
     Serial.println(">>> ⚠️ Khong tim thay user!");
     return;
   }
   
   String userName = userNames[userIndex];
   
   // LƯU THỜI GIAN CHẤM CÔNG TRƯỚC (quan trọng: phải lưu ngay khi thành công)
   if (currentUseCase == TIME_CLOCK) {
     saveTimeClockRecord(currentRFID);
   }
   
   // Lưu log
   saveAccessLog(userName, currentRFID, true);
   
   // Gửi log lên server
   sendLogToServer(currentRFID, userName, true);
   
  // BẬT LED XANH KHI ACCESS GRANTED (cho tất cả use cases)
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
  
  // Hiển thị thành công dựa trên use case
  switch(currentUseCase) {
    case TIME_CLOCK:
      displayTimeClockSuccess(userName);
      Serial.println(">>> CHAM CONG THANH CONG!");
      Serial.println(">>> Thoi gian: " + getCurrentTime());
      // LED xanh sáng 2 giây cho chấm công
      delay(2000);
      break;
      
    case ELEVATOR:
      displayElevatorSuccess(userName);
      Serial.println(">>> THANG MAY MO CUA!");
      Serial.println(">>> Ban co the vao thang may");
      // LED xanh sáng 3 giây cho thang máy
      delay(3000);
      break;
      
    case DOOR_ACCESS:
      displayDoorSuccess(userName);
      Serial.println(">>> CUA MO!");
      digitalWrite(RELAY_PIN, HIGH); // Mở khóa
      // LED xanh sáng 3 giây cho cửa ra vào
      delay(3000);
      digitalWrite(RELAY_PIN, LOW); // Đóng khóa
      break;
  }
  
  beep(2);
  // Tắt LED xanh sau khi hiển thị
  digitalWrite(LED_GREEN, LOW);
  resetState();
 }
 
 // ========== DISPLAY FUNCTIONS ==========
 void displayWelcome() {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(20, 5);
   display.println("=== 2FA SYSTEM ===");
   
   display.setCursor(10, 20);
   switch(currentUseCase) {
     case TIME_CLOCK:
       display.println("Mode: CHAM CONG");
       break;
     case ELEVATOR:
       display.println("Mode: THANG MAY");
       break;
     case DOOR_ACCESS:
       display.println("Mode: CUA RA VAO");
       break;
   }
   
   display.setCursor(10, 35);
   display.println("Quet the RFID...");
   
   display.setCursor(10, 50);
   display.println("RFID + OTP Auth");
   
   display.display();
 }
 
 void displayOTPRequest(String userName, String email, String otpCode) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(5, 0);
   display.println("User: " + userName);
   
   display.setCursor(5, 15);
   display.println("OTP sent to:");
   display.setCursor(5, 25);
   display.println(email);
   
   // OTP code KHÔNG hiển thị trên OLED (bảo mật)
   // Chỉ hiển thị trên Serial Monitor để test
   display.setTextSize(1);
   display.setCursor(5, 45);
   display.println("Kiem tra email!");
   
   display.setCursor(5, 58);
   display.println("Nhap OTP code");
   
   display.display();
 }
 
 void displayTimeClockSuccess(String userName) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(15, 5);
   display.println("CHAM CONG");
   
   display.setCursor(5, 20);
   display.println("User: " + userName);
   
   display.setCursor(5, 35);
   display.println("Thoi gian: " + getCurrentTime());
   
   display.setCursor(20, 50);
   display.setTextSize(2);
   display.setTextColor(SSD1306_WHITE);
   display.println("SUCCESS!");
   
   display.display();
 }
 
 void displayElevatorSuccess(String userName) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(15, 5);
   display.println("THANG MAY");
   
   display.setCursor(5, 20);
   display.println("User: " + userName);
   
   display.setCursor(20, 40);
   display.setTextSize(2);
   display.println("MO CUA");
   
   display.display();
 }
 
 void displayDoorSuccess(String userName) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(15, 5);
   display.println("CUA RA VAO");
   
   display.setCursor(5, 20);
   display.println("User: " + userName);
   
   display.setCursor(20, 40);
   display.setTextSize(2);
   display.println("MO KHOa");
   
   display.display();
 }
 
 void displayError(String message) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   display.setCursor(20, 20);
   display.println("ERROR!");
   
   display.setCursor(5, 35);
   display.println(message);
   
   display.display();
 }
 
 // ========== LOADING ANIMATION ==========
 void displayLoading(String message, int percentage) {
   display.clearDisplay();
   display.setTextSize(1);
   display.setTextColor(SSD1306_WHITE);
   
   // Hiển thị message
   display.setCursor(5, 5);
   display.println(message);
   
   // Vẽ progress bar
   int barWidth = 118;
   int barHeight = 10;
   int barX = 5;
   int barY = 25;
   
   // Vẽ khung progress bar
   display.drawRect(barX, barY, barWidth, barHeight, SSD1306_WHITE);
   
   // Vẽ phần đã load
   int filledWidth = (barWidth * percentage) / 100;
   if (filledWidth > 0) {
     display.fillRect(barX + 1, barY + 1, filledWidth - 2, barHeight - 2, SSD1306_WHITE);
   }
   
   // Hiển thị phần trăm
   display.setCursor(50, 45);
   display.setTextSize(2);
   display.println(String(percentage) + "%");
   
   // Hiển thị animation dots
   display.setTextSize(1);
   display.setCursor(5, 58);
   int dotCount = (millis() / 200) % 4;
   String dots = "";
   for (int i = 0; i < dotCount; i++) {
     dots += ".";
   }
   display.println("Loading" + dots);
   
   display.display();
 }
 
 // ========== HELPER FUNCTIONS ==========
 String generateOTP() {
   // Demo: Tạo OTP ngẫu nhiên 6 chữ số
   // Trong thực tế: Lấy từ server
   return String(random(100000, 999999));
 }
 
 int findUserIndex(String cardUID) {
   for (int i = 0; i < numCards; i++) {
     if (validCards[i] == cardUID) {
       return i;
     }
   }
   return -1;
 }
 
 String getCurrentTime() {
   // Demo: Trả về thời gian giả
   // Trong thực tế: Lấy từ RTC hoặc NTP
   return "12:45:30";
 }
 
 void saveAccessLog(String userName, String rfid_uid, bool success) {
   if (logCount < 20) {
     accessLogs[logCount].userName = userName;
     accessLogs[logCount].rfid_uid = rfid_uid;
     accessLogs[logCount].timestamp = getCurrentTime();
     accessLogs[logCount].success = success;
     logCount++;
   }
 }
 
 void resetState() {
   // Reset tất cả state về ban đầu
   waitingForOTP = false;
   currentOTPCode = "";
   sessionToken = "";
   currentRFID = "";
   otpAttempts = 0;
   lastCardRead = 0;
   displayWelcome();
   
   Serial.println(">>> State da duoc reset");
   Serial.println(">>> San sang quet the RFID moi");
 }
 
 void beep(int times) {
   for (int i = 0; i < times; i++) {
     digitalWrite(BUZZER_PIN, HIGH);
     delay(100);
     digitalWrite(BUZZER_PIN, LOW);
     delay(100);
   }
 }
 
 void connectToWiFi() {
   WiFi.begin(ssid, password);
   int attempts = 0;
   while (WiFi.status() != WL_CONNECTED && attempts < 20) {
     delay(500);
     Serial.print(".");
     attempts++;
   }
   if (WiFi.status() == WL_CONNECTED) {
     Serial.println("\nWiFi connected!");
   } else {
     Serial.println("\nWiFi failed - Using demo mode");
   }
 }
 
 // ========== GỬI OTP QUA EMAIL (QUA SERVER) ==========
 void sendOTPToEmail(String cardUID, String userName, String userEmail) {
   // Kết nối server để gửi OTP qua email
   if (WiFi.status() == WL_CONNECTED) {
     HTTPClient http;
     String url = String(serverURL) + "/api/verify-rfid";
     
     http.begin(url);
     http.addHeader("Content-Type", "application/json");
     
     String jsonData = "{\"rfid_uid\":\"" + cardUID + "\"}";
     int httpResponseCode = http.POST(jsonData);
     
     if (httpResponseCode == 200) {
       String response = http.getString();
       
       // Parse response để lấy OTP và email status
       if (response.indexOf("\"email_sent\":true") > 0) {
         Serial.println(">>> ✓ OTP da duoc gui den email!");
         
         // Parse OTP từ response nếu có
         int otpStart = response.indexOf("\"otp_code\":\"") + 12;
         int otpEnd = response.indexOf("\"", otpStart);
         if (otpStart > 11 && otpEnd > otpStart) {
           String serverOTP = response.substring(otpStart, otpEnd);
           currentOTPCode = serverOTP; // Cập nhật OTP từ server
         }
       } else {
         Serial.println(">>> ⚠️ Email khong duoc gui (kiem tra cau hinh server)");
         Serial.println(">>> Su dung OTP hien thi tren OLED: " + currentOTPCode);
       }
     } else {
       Serial.println(">>> ⚠️ Khong ket noi duoc server");
       Serial.println(">>> Su dung OTP demo: " + currentOTPCode);
     }
     
     http.end();
   } else {
     Serial.println(">>> ⚠️ WiFi chua ket noi - Su dung OTP demo");
     Serial.println(">>> OTP hien thi tren OLED: " + currentOTPCode);
   }
 }
 
 // ========== TIME CLOCK COOLDOWN FUNCTIONS ==========
 unsigned long getLastClockTime(String cardUID) {
   // Tìm thời gian chấm công cuối cùng của card này
   for (int i = 0; i < timeClockRecordCount; i++) {
     if (timeClockRecords[i].rfid_uid == cardUID) {
       return timeClockRecords[i].lastClockTime;
     }
   }
   return 0; // Chưa có record
 }
 
 void saveTimeClockRecord(String cardUID) {
   unsigned long currentTime = millis();
   
   // Tìm xem card này đã có record chưa
   int existingIndex = -1;
   for (int i = 0; i < timeClockRecordCount; i++) {
     if (timeClockRecords[i].rfid_uid == cardUID) {
       existingIndex = i;
       break;
     }
   }
   
   if (existingIndex >= 0) {
     // Cập nhật record cũ với thời gian hiện tại
     timeClockRecords[existingIndex].lastClockTime = currentTime;
     Serial.println(">>> Updated cooldown for card " + cardUID + " at " + String(currentTime) + "ms");
   } else {
     // Tạo record mới
     if (timeClockRecordCount < 10) {
       timeClockRecords[timeClockRecordCount].rfid_uid = cardUID;
       timeClockRecords[timeClockRecordCount].lastClockTime = currentTime;
       timeClockRecordCount++;
       Serial.println(">>> Created new cooldown record for card " + cardUID + " at " + String(currentTime) + "ms");
     } else {
       // Đầy rồi, thay thế record cũ nhất
       int oldestIndex = 0;
       unsigned long oldestTime = timeClockRecords[0].lastClockTime;
       for (int i = 1; i < 10; i++) {
         // Xử lý overflow
         unsigned long time1 = timeClockRecords[i].lastClockTime;
         unsigned long time2 = oldestTime;
         if (time1 < time2 && (time2 - time1) < ULONG_MAX / 2) {
           oldestTime = time1;
           oldestIndex = i;
         } else if (time1 > time2 && (time1 - time2) > ULONG_MAX / 2) {
           oldestTime = time1;
           oldestIndex = i;
         }
       }
       timeClockRecords[oldestIndex].rfid_uid = cardUID;
       timeClockRecords[oldestIndex].lastClockTime = currentTime;
       Serial.println(">>> Replaced oldest cooldown record with card " + cardUID + " at " + String(currentTime) + "ms");
     }
   }
 }
 
// ========== GỬI LOG LÊN SERVER ==========
void sendLogToServer(String cardUID, String userName, bool success) {
  // Backend đã deploy lên Render: https://esp322fa.onrender.com
  // ESP32 trong Wokwi có thể kết nối đến URL public này
  
  HTTPClient http;
  String url = String(serverURL) + "/api/esp32/log-access";
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // Tăng timeout lên 5 giây cho Render (có thể chậm khi sleep)
  
  // Tạo timestamp ISO format
  String timestamp = getCurrentTimeISO();
  
  // Tạo JSON data
  String jsonData = "{";
  jsonData += "\"rfid_uid\":\"" + cardUID + "\",";
  jsonData += "\"user_name\":\"" + userName + "\",";
  jsonData += "\"success\":" + String(success ? "true" : "false") + ",";
  jsonData += "\"timestamp\":\"" + timestamp + "\"";
  jsonData += "}";
  
  Serial.println(">>> Dang gui log len server...");
  Serial.println(">>> URL: " + url);
  
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println(">>> ✓✓✓ Log da duoc gui len server thanh cong!");
    Serial.println(">>> Response: " + response);
  } else {
    Serial.println(">>> ⚠️ Khong gui duoc log tu ESP32 (code: " + String(httpResponseCode) + ")");
    Serial.println(">>>    Kiem tra:");
    Serial.println(">>>    1. Backend da wake up chua? (Render free tier sleep sau 15 phut)");
    Serial.println(">>>    2. URL backend dung chua? (" + String(serverURL) + ")");
    Serial.println(">>>    3. WiFi da ket noi chua?");
  }
  
  http.end();
}
 
 // Tạo timestamp ISO format cho server
 String getCurrentTimeISO() {
   // Trong thực tế: Lấy từ NTP server
   // Demo: Trả về timestamp giả
   unsigned long now = millis();
   unsigned long seconds = now / 1000;
   unsigned long minutes = seconds / 60;
   unsigned long hours = minutes / 60;
   
   // Format: YYYY-MM-DDTHH:MM:SS
   String timestamp = "2025-12-02T";
   timestamp += String((hours % 24) < 10 ? "0" : "") + String(hours % 24) + ":";
   timestamp += String((minutes % 60) < 10 ? "0" : "") + String(minutes % 60) + ":";
   timestamp += String((seconds % 60) < 10 ? "0" : "") + String(seconds % 60);
   
   return timestamp;
 }
 
 