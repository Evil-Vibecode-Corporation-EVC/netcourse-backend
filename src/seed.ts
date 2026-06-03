// src/seed.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/schema";
import "dotenv/config";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const [cyberCourse, networkingCourse, programmingCourse, webSecCourse] =
      await db
        .insert(schema.courses)
        .values([
          {
            title: "Основы кибербезопасности",
            description:
              "Курс знакомит с основами защиты информации, типами угроз, методами шифрования и принципами безопасности сетей.",
            category: "cybersecurity",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 65,
          },
          {
            title: "Компьютерные сети и протоколы",
            description:
              "Курс охватывает основы сетевых технологий: модели OSI и TCP/IP, IP-адресацию, маршрутизацию, протоколы HTTP, DNS, DHCP.",
            category: "networking",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 70,
          },
          {
            title: "Введение в программирование на Python",
            description:
              "Базовый курс по программированию на языке Python: переменные, условия, циклы, функции, работа с файлами.",
            category: "programming",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 65,
          },
          {
            title: "Основы веб-безопасности",
            description:
              "Курс по основам безопасности веб-приложений: OWASP Top 10, XSS, SQL-инъекции, CSRF и методы защиты. Требуется активная подписка.",
            category: "cybersecurity",
            price: 1500,
            requireQuizCompletion: true,
            minQuizScore: 70,
          },
        ])
        .returning();

    console.log("✅ Added 4 courses");

    const cyberSections = await db
      .insert(schema.sections)
      .values([
        {
          courseId: cyberCourse.id,
          title: "Введение в кибербезопасность",
          orderIndex: 0,
        },
        { courseId: cyberCourse.id, title: "Типы угроз", orderIndex: 1 },
        {
          courseId: cyberCourse.id,
          title: "Криптография и шифрование",
          orderIndex: 2,
        },
        {
          courseId: cyberCourse.id,
          title: "Безопасность сетей",
          orderIndex: 3,
        },
        {
          courseId: cyberCourse.id,
          title: "Практические рекомендации",
          orderIndex: 4,
        },
      ])
      .returning();

    const networkingSections = await db
      .insert(schema.sections)
      .values([
        { courseId: networkingCourse.id, title: "Основы сетей", orderIndex: 0 },
        {
          courseId: networkingCourse.id,
          title: "Модели OSI и TCP/IP",
          orderIndex: 1,
        },
        {
          courseId: networkingCourse.id,
          title: "IP-адресация и подсети",
          orderIndex: 2,
        },
        {
          courseId: networkingCourse.id,
          title: "Маршрутизация",
          orderIndex: 3,
        },
        {
          courseId: networkingCourse.id,
          title: "Протоколы прикладного уровня",
          orderIndex: 4,
        },
      ])
      .returning();

    const programmingSections = await db
      .insert(schema.sections)
      .values([
        {
          courseId: programmingCourse.id,
          title: "Введение в Python",
          orderIndex: 0,
        },
        {
          courseId: programmingCourse.id,
          title: "Условные операторы",
          orderIndex: 1,
        },
        { courseId: programmingCourse.id, title: "Циклы", orderIndex: 2 },
        { courseId: programmingCourse.id, title: "Функции", orderIndex: 3 },
        {
          courseId: programmingCourse.id,
          title: "Работа с файлами",
          orderIndex: 4,
        },
      ])
      .returning();

    const [webSecSection] = await db
      .insert(schema.sections)
      .values([
        {
          courseId: webSecCourse.id,
          title: "Уязвимости веб-приложений",
          orderIndex: 0,
        },
      ])
      .returning();

    console.log("✅ Added 16 sections");

    // Cybersecurity lessons (Russian)
    await db.insert(schema.lessons).values([
      {
        sectionId: cyberSections[0].id,
        title: "Что такое кибербезопасность?",
        contentType: "text",
        textContent: `# Что такое кибербезопасность?

Кибербезопасность — это практика защиты компьютерных систем, сетей и данных от цифровых атак, несанкционированного доступа и повреждения.

## Основные цели кибербезопасности (CIA Triad)
- **Конфиденциальность (Confidentiality)** — доступ к данных только у авторизованных лиц
- **Целостность (Integrity)** — защита данных от несанкционированного изменения
- **Доступность (Availability)** — гарантия доступа к системе для авторизованных пользователей

## Почему это важно?
- Рост числа кибератак
- Утечки данных
- Финансовые потери
- Репутационные риски`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[0].id,
        title: "Основные принципы защиты",
        contentType: "text",
        textContent: `# Основные принципы защиты

## Защита на нескольких уровнях
- Физический уровень
- Сетевой уровень
- Уровень приложений
- Уровень данных

## Минимизация привилегий
Пользователи и системы должны иметь только те права, которые необходимы для выполнения их функций.

## Разделение обязанностей
Ни один человек не должен иметь полный контроль над критической системой.

## Защита в глубину
Множество слоёв защиты: если один слой пробит, другие остаются активными.`,
        orderIndex: 1,
      },
      {
        sectionId: cyberSections[1].id,
        title: "Вредоносное программное обеспечение",
        contentType: "text",
        textContent: `# Вредоносное программное обеспечение (Malware)

## Виды вредоносного ПО

| Тип | Описание |
|-----|----------|
| Вирусы | Самовоспроизводящийся код, заражающий файлы |
| Черви | Распространяются через сети без участия пользователя |
| Трояны | Маскируются под полезные программы |
| Шпионское ПО | Собирает информацию о пользователе |
| Ransomware | Шифрует данные и требует выкуп |
| Adware | Показывает нежелательную рекламу |

## Признаки заражения
- Медленная работа системы
- Неожиданные всплывающие окна
- Изменение настроек браузера
- Необычная сетевая активность`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[2].id,
        title: "Симметричное и асимметричное шифрование",
        contentType: "text",
        textContent: `# Симметричное и асимметричное шифрование

## Симметричное шифрование
- Один ключ для шифрования и дешифрования
- Быстрое, но проблема передачи ключа
- Примеры: AES, DES, ChaCha20

## Асимметричное шифрование
- Пара ключей: публичный и приватный
- Медленнее, но безопаснее для обмена
- Примеры: RSA, ECC

## Гибридные системы
Используют асимметричное шифрование для обмена симметричным ключом, затем симметричное для данных.

## Хеширование
Односторонняя функция для проверки целостности (MD5, SHA-256).`,
        orderIndex: 0,
      },
    ]);

    // Networking lessons (Russian)
    await db.insert(schema.lessons).values([
      {
        sectionId: networkingSections[0].id,
        title: "Что такое компьютерная сеть?",
        contentType: "text",
        textContent: `# Что такое компьютерная сеть?

Компьютерная сеть — это два или более устройства, соединённых между собой для обмена данными и ресурсами.

## Типы сетей по размеру
- **PAN** (Personal Area Network) — Bluetooth, USB
- **LAN** (Local Area Network) — дом, офис, школа
- **MAN** (Metropolitan Area Network) — город
- **WAN** (Wide Area Network) — Интернет

## Топологии сетей
- Шина (Bus)
- Звезда (Star)
- Кольцо (Ring)
- Полносвязная (Mesh)

## Основные компоненты
- Коммутаторы (Switches)
- Маршрутизаторы (Routers)
- Сетевые кабели
- Беспроводные точки доступа`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[0].id,
        title: "Сетевые устройства",
        contentType: "text",
        textContent: `# Сетевые устройства

## Коммутатор (Switch)
- Работает на канальном уровне (L2)
- Соединяет устройства внутри одной сети
- Передаёт кадры по MAC-адресам

## Маршрутизатор (Router)
- Работает на сетевом уровне (L3)
- Соединяет разные сети
- Передаёт пакеты по IP-адресам

## Концентратор (Hub) — устарел
- Просто повторяет сигнал на все порты
- Неэффективно, много коллизий

## Точка доступа (Access Point)
- Беспроводной коммутатор
- Подключает Wi-Fi устройства к проводной сети

## Межсетевой экран (Firewall)
- Фильтрует трафик по правилам
- Защищает сеть от несанкционированного доступа`,
        orderIndex: 1,
      },
      {
        sectionId: networkingSections[1].id,
        title: "Модель OSI (7 уровней)",
        contentType: "text",
        textContent: `# Модель OSI (Open Systems Interconnection)

Модель OSI — эталонная модель взаимодействия открытых систем, разработанная ISO.

## Семь уровней модели OSI

| Уровень | Название | Функция | Протоколы/Устройства |
|---------|----------|---------|---------------------|
| 7 | Прикладной | Взаимодействие с приложениями | HTTP, FTP, SMTP |
| 6 | Представления | Шифрование, сжатие, преобразование данных | SSL/TLS, JPEG |
| 5 | Сеансовый | Управление сессией, синхронизация | NetBIOS, RPC |
| 4 | Транспортный | Надёжная доставка, контроль ошибок | TCP, UDP |
| 3 | Сетевой | Маршрутизация, IP-адресация | IP, маршрутизатор |
| 2 | Канальный | Передача кадров, MAC-адреса | Ethernet, коммутатор |
| 1 | Физический | Передача битов, сигналы | Кабели, концентратор |

## Правило запоминания
**P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[1].id,
        title: "Модель TCP/IP",
        contentType: "text",
        textContent: `# Модель TCP/IP (DoD Model)

Современный стек протоколов Интернета, разработанный Министерством обороны США.

## 4 уровня модели TCP/IP

| Уровень | Название | Протоколы | Соответствие OSI |
|---------|----------|-----------|------------------|
| 4 | Прикладной | HTTP, HTTPS, DNS, SMTP, FTP, SSH | Уровни 5-7 |
| 3 | Транспортный | TCP, UDP | Уровень 4 |
| 2 | Межсетевой | IP, ICMP, ARP | Уровень 3 |
| 1 | Сетевого доступа | Ethernet, Wi-Fi, PPP | Уровни 1-2 |

## Сравнение OSI и TCP/IP
- OSI — теоретическая, 7 уровней, сложная
- TCP/IP — практическая, 4 уровня, простая

## Инкапсуляция данных
Данные → Сегмент (TCP/UDP) → Пакет (IP) → Кадр (Ethernet) → Биты`,
        orderIndex: 1,
      },
      {
        sectionId: networkingSections[2].id,
        title: "IPv4 и IPv6",
        contentType: "text",
        textContent: `# IPv4 и IPv6

## IPv4
- 32-битный адрес (4 октета)
- Пример: 192.168.1.1
- Всего адресов: ~4.3 миллиарда
- Формат записи: десятичный с точками

## Классы IPv4 адресов
| Класс | Начало | Маска | Назначение |
|-------|--------|-------|------------|
| A | 1-126 | /8 | Крупные сети |
| B | 128-191 | /16 | Средние сети |
| C | 192-223 | /24 | Малые сети |
| D | 224-239 | - | Мультикаст |
| E | 240-255 | - | Экспериментальные |

## Частные IPv4 адреса
- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

## IPv6
- 128-битный адрес (8 групп по 16 бит)
- Пример: 2001:0db8:85a3::8a2e:0370:7334
- Адресов достаточно для каждого устройства на Земле
- Исчезает необходимость в NAT`,
        orderIndex: 0,
      },
    ]);

    // Programming lessons (Kazakh)
    await db.insert(schema.lessons).values([
      {
        sectionId: programmingSections[0].id,
        title: "Python тіліне кіріспе",
        contentType: "text",
        textContent: `# Python тіліне кіріспе

Python — қарапайым және оқуға оңай бағдарламалау тілі.

## Неліктен Python?
- Қарапайым синтаксис
- Үлкен кітапханалар жинағы
- Кросс-платформалық
- Үлкен қауымдастық

## Орнату
1. python.org сайтынан жүктеңіз
2. Орнату кезінде "Add to PATH" қосыңыз
3. Тексеру: \`python --version\`

## Бірінші бағдарлама
\`\`\`python
print("Сәлем, әлем!")
\`\`\`

## Пікірлер (Comments)
\`\`\`python
# Бұл бір жолды пікір
"""
Бұл көп жолды пікір
екінші жол
"""
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[0].id,
        title: "Айнымалылар және деректер түрлері",
        contentType: "text",
        textContent: `# Айнымалылар және деректер түрлері

## Айнымалылар
Айнымалы — бұл мәнді сақтайтын контейнер.

\`\`\`python
аты = "Асан"        # жол (string)
жасы = 20           # бүтін сан (integer)
баға = 12.5         # ондық сан (float)
белсенді = True     # логикалық (boolean)
\`\`\`

## Негізгі деректер түрлері

| Түрі | Мысал | Сипаттама |
|------|-------|------------|
| int | 10, -5, 0 | Бүтін сандар |
| float | 3.14, -2.5 | Ондық сандар |
| str | "Hello", 'Python' | Мәтін (жол) |
| bool | True, False | Логикалық мән |

## Айнымалыға мән беру
\`\`\`python
x = 5
y = x
z = y + 3
\`\`\`

## Деректер түрін тексеру
\`\`\`python
type(10)        # <class 'int'>
type("Python")  # <class 'str'>
\`\`\``,
        orderIndex: 1,
      },
      {
        sectionId: programmingSections[1].id,
        title: "if, elif, else шарт операторлары",
        contentType: "text",
        textContent: `# Шарт операторлары: if, elif, else

## if операторы
Шарт ақиқат болғанда ғана код орындалады.

\`\`\`python
жас = 18

if жас >= 18:
    print("Сіз кәмелетке толғансыз")
\`\`\`

## if-else
\`\`\`python
жас = 16

if жас >= 18:
    print("Кіруге рұқсат")
else:
    print("Кіруге тыйым салынған")
\`\`\`

## if-elif-else (бірнеше шарт)
\`\`\`python
баға = 85

if баға >= 90:
    деңгей = "A"
elif баға >= 75:
    деңгей = "B"
elif баға >= 60:
    деңгей = "C"
else:
    деңгей = "D"

print(f"Сіздің деңгейіңіз: {деңгей}")
\`\`\`

## Логикалық операторлар
- \`and\` — екеуі де ақиқат болуы керек
- \`or\` — біреуі ақиқат болса жеткілікті
- \`not\` — мәнді керісінше өзгертеді

## Тернарлық оператор
\`\`\`python
жас = 20
статус = "Кәмелетке толған" if жас >= 18 else "Кәмелетке толмаған"
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[2].id,
        title: "for және while циклдері",
        contentType: "text",
        textContent: `# Циклдер: for және while

## for циклі
Белгілі саны рет қайталау үшін қолданылады.

\`\`\`python
# range() функциясы
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Тізім бойынша
аттар = ["Асан", "Ұлан", "Дастан"]
for ат in аттар:
    print(f"Қош келдің, {ат}!")

# range(басы, соңы, қадам)
for i in range(2, 10, 2):
    print(i)  # 2, 4, 6, 8
\`\`\`

## while циклі
Шарт ақиқат болғанша қайталайды.

\`\`\`python
санау = 0
while санау < 5:
    print(санау)
    санау += 1
\`\`\`

## break және continue
- \`break\` — циклді тоқтатады
- \`continue\` — ағымдағы итерацияны өткізіп, келесіге өтеді

\`\`\`python
for i in range(10):
    if i == 3:
        continue  # 3-ті өткізеді
    if i == 7:
        break     # 7-де тоқтайды
    print(i)      # 0,1,2,4,5,6
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[3].id,
        title: "Функциялар",
        contentType: "text",
        textContent: `# Функциялар

Функция — бұл белгілі бір тапсырманы орындайтын қайта пайдаланылатын код блогы.

## Функцияны анықтау (def)
\`\`\`python
def шылау():
    print("Сәлем, әлем!")

шылау()  # Функцияны шақыру
\`\`\`

## Параметрлері бар функция
\`\`\`python
def сәлем_беру(ат):
    print(f"Сәлем, {ат}!")

сәлем_беру("Асан")
сәлем_беру("Майра")
\`\`\`

## Мәнді қайтаратын функция (return)
\`\`\`python
def қосу(a, b):
    return a + b

нәтиже = қосу(5, 3)
print(нәтиже)  # 8
\`\`\`

## Көп параметрлер
\`\`\`python
def тік_төртбұрыш_ауданы(ені, биіктігі):
    return ені * биіктігі

аудан = тік_төртбұрыш_ауданы(10, 5)
print(аудан)  # 50
\`\`\`

## Default параметрлер
\`\`\`python
def қош_келдің(ат, тіл="kk"):
    if тіл == "kk":
        print(f"Қош келдің, {ат}!")
    else:
        print(f"Welcome, {ат}!")
\`\`\``,
        orderIndex: 0,
      },
    ]);

    const [webSecLesson1, webSecLesson2] = await db
      .insert(schema.lessons)
      .values([
        {
          sectionId: webSecSection.id,
          title: "OWASP Top 10: основные угрозы",
          contentType: "text",
          textContent: `# OWASP Top 10: основные угрозы веб-приложений

OWASP (Open Web Application Security Project) публикует список 10 самых критичных угроз для веб-приложений.

## 1. Broken Access Control
Нарушение контроля доступа — пользователь получает доступ к данным или функциям, на которые у него нет прав.

**Пример:** Изменение ID в URL для просмотра чужого профиля.

## 2. Cryptographic Failures
Слабое шифрование или его отсутствие. Пароли в открытом виде, устаревшие алгоритмы.

## 3. Injection (SQL, NoSQL, OS Command)
Внедрение вредоносных данных в интерпретатор.

**Пример SQL-инъекции:**
\`\`\`sql
' OR '1'='1' --
\`\`\`
Такой ввод может обойти аутентификацию.

## 4. Insecure Design
Ошибки в архитектуре приложения: отсутствие лимитов, слабая валидация.

## 5. Security Misconfiguration
Ошибки конфигурации: стандартные пароли, открытые порты, включённые debug-режимы.

## 6. Vulnerable and Outdated Components
Использование библиотек с известными уязвимостями.

## 7. Identification and Authentication Failures
Слабая аутентификация: нет MFA, простые пароли, уязвимости в сессиях.

## 8. Software and Data Integrity Failures
Нарушение целостности: отсутствие проверки подписей обновлений.

## 9. Security Logging and Monitoring Failures
Отсутствие логирования и мониторинга инцидентов.

## 10. Server-Side Request Forgery (SSRF)
Атакующий заставляет сервер делать запросы к внутренним ресурсам.

## Основные методы защиты
- Валидация и экранирование всех входных данных
- Параметризованные запросы к БД
- Принцип наименьших привилегий
- Регулярное обновление зависимостей
- Использование Content-Security-Policy заголовков`,
          orderIndex: 0,
        },
        {
          sectionId: webSecSection.id,
          title: "XSS и CSRF атаки",
          contentType: "text",
          textContent: `# XSS (Cross-Site Scripting) и CSRF

## XSS — Межсайтовый скриптинг

Внедрение JavaScript кода на страницу, который выполняется в браузере жертвы.

### Типы XSS
| Тип | Описание |
|-----|----------|
| Reflected (отражённый) | Код передаётся в URL и сразу выполняется |
| Stored (сохранённый) | Код сохраняется на сервере (в БД) |
| DOM-based | Уязвимость на стороне клиента |

### Пример Reflected XSS
\`\`\`html
https://example.com/search?q=<script>alert('XSS')</script>
\`\`\`

### Защита от XSS
- Экранирование вывода (htmlspecialchars, DOMPurify)
- Content-Security-Policy заголовок
- HttpOnly куки

## CSRF (Cross-Site Request Forgery)

Атакующий заставляет жертву выполнить нежелательное действие на сайте, где она аутентифицирована.

### Защита от CSRF
- CSRF-токены в формах
- SameSite куки (Strict/Lax)
- Проверка Origin/Referer заголовков`,
          orderIndex: 1,
        },
      ])
      .returning();

    console.log(
      "✅ Added 14 lessons (4 cybersecurity, 5 networking, 5 programming, 2 web security)",
    );

    const [webSecQuiz] = await db
      .insert(schema.quizzes)
      .values([{ lessonId: webSecLesson1.id, title: "OWASP Top 10: проверка" }])
      .returning();

    console.log("✅ Added 1 quiz for web security");

    const [q1, q2, q3] = await db
      .insert(schema.questions)
      .values([
        {
          quizId: webSecQuiz.id,
          questionText:
            "Какой тип XSS передаётся через URL и выполняется сразу?",
          questionType: "single",
        },
        {
          quizId: webSecQuiz.id,
          questionText:
            "Какие из перечисленных методов помогают защититься от SQL-инъекций?",
          questionType: "multiple",
        },
        {
          quizId: webSecQuiz.id,
          questionText: "Какой заголовок HTTP помогает защититься от XSS-атак?",
          questionType: "single",
        },
      ])
      .returning();

    await db.insert(schema.answers).values([
      {
        questionId: q1.id,
        answerText: "Reflected XSS",
        isCorrect: true,
      },
      {
        questionId: q1.id,
        answerText: "Stored XSS",
        isCorrect: false,
      },
      {
        questionId: q1.id,
        answerText: "DOM-based XSS",
        isCorrect: false,
      },
      {
        questionId: q2.id,
        answerText: "Параметризованные запросы (Prepared Statements)",
        isCorrect: true,
      },
      {
        questionId: q2.id,
        answerText: "Экранирование спецсимволов вручную",
        isCorrect: true,
      },
      {
        questionId: q2.id,
        answerText: "Использование ORM без валидации",
        isCorrect: false,
      },
      {
        questionId: q2.id,
        answerText: "Проверка типа входных данных (типизация)",
        isCorrect: false,
      },
      {
        questionId: q3.id,
        answerText: "Content-Security-Policy",
        isCorrect: true,
      },
      {
        questionId: q3.id,
        answerText: "Access-Control-Allow-Origin",
        isCorrect: false,
      },
      {
        questionId: q3.id,
        answerText: "X-Frame-Options",
        isCorrect: false,
      },
    ]);

    console.log("✅ Added 3 questions and 10 answers for web security quiz");
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
