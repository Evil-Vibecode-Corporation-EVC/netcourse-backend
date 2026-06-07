import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/schema";
import { and, eq, or, inArray } from "drizzle-orm";
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
  console.log("Seeding database...");

  try {
    const [cyberCourse, networkingCourse, programmingCourse, webSecCourse] =
      await db
        .insert(schema.courses)
        .values([
          {
            title: "Основы кибербезопасности",
            description: "Курс знакомит с основами защиты информации, типами угроз, методами шифрования и принципами безопасности сетей.",
            category: "cybersecurity",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 65,
          },
          {
            title: "Компьютерные сети и протоколы",
            description: "Курс охватывает основы сетевых технологий: модели OSI и TCP/IP, IP-адресацию, маршрутизацию, протоколы HTTP, DNS, DHCP.",
            category: "networking",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 70,
          },
          {
            title: "Введение в программирование на Python",
            description: "Базовый курс по программированию на языке Python: переменные, условия, циклы, функции, работа с файлами.",
            category: "programming",
            price: null,
            requireQuizCompletion: true,
            minQuizScore: 65,
          },
          {
            title: "Основы веб-безопасности",
            description: "Курс по основам безопасности веб-приложений: OWASP Top 10, XSS, SQL-инъекции, CSRF и методы защиты. Требуется активная подписка.",
            category: "cybersecurity",
            price: 15000,
            requireQuizCompletion: true,
            minQuizScore: 70,
          },
        ])
        .returning();

    console.log("Added 4 courses");

    const cyberSections = await db
      .insert(schema.sections)
      .values([
        { courseId: cyberCourse.id, title: "Введение в кибербезопасность", orderIndex: 0 },
        { courseId: cyberCourse.id, title: "Типы угроз", orderIndex: 1 },
        { courseId: cyberCourse.id, title: "Криптография и шифрование", orderIndex: 2 },
        { courseId: cyberCourse.id, title: "Безопасность сетей", orderIndex: 3 },
        { courseId: cyberCourse.id, title: "Практические рекомендации", orderIndex: 4 },
      ])
      .returning();

    const networkingSections = await db
      .insert(schema.sections)
      .values([
        { courseId: networkingCourse.id, title: "Основы сетей", orderIndex: 0 },
        { courseId: networkingCourse.id, title: "Модели OSI и TCP/IP", orderIndex: 1 },
        { courseId: networkingCourse.id, title: "IP-адресация и подсети", orderIndex: 2 },
        { courseId: networkingCourse.id, title: "Маршрутизация", orderIndex: 3 },
        { courseId: networkingCourse.id, title: "Протоколы прикладного уровня", orderIndex: 4 },
      ])
      .returning();

    const programmingSections = await db
      .insert(schema.sections)
      .values([
        { courseId: programmingCourse.id, title: "Python тіліне кіріспе", orderIndex: 0 },
        { courseId: programmingCourse.id, title: "Шарт операторлары", orderIndex: 1 },
        { courseId: programmingCourse.id, title: "Циклдер", orderIndex: 2 },
        { courseId: programmingCourse.id, title: "Функциялар", orderIndex: 3 },
        { courseId: programmingCourse.id, title: "Файлдармен жұмыс", orderIndex: 4 },
      ])
      .returning();

    const [webSecSection1, webSecSection2, webSecSection3] = await db
      .insert(schema.sections)
      .values([
        { courseId: webSecCourse.id, title: "Уязвимости веб-приложений", orderIndex: 0 },
        { courseId: webSecCourse.id, title: "SQL-инъекции", orderIndex: 1 },
        { courseId: webSecCourse.id, title: "Безопасность API", orderIndex: 2 },
      ])
      .returning();

    console.log("Added 18 sections");

    await db.insert(schema.lessons).values([
      // Cybersecurity: section 0 (2 lessons)
      {
        sectionId: cyberSections[0].id,
        title: "Что такое кибербезопасность?",
        contentType: "text",
        textContent: `# Что такое кибербезопасность?

Кибербезопасность — это практика защиты компьютерных систем, сетей и данных от цифровых атак.

## Основные цели (CIA Triad)
- **Конфиденциальность** — доступ к данным только у авторизованных лиц
- **Целостность** — защита данных от несанкционированного изменения
- **Доступность** — гарантия доступа для авторизованных пользователей

## Почему это важно?
- Рост числа кибератак и утечек данных
- Финансовые потери и репутационные риски`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[0].id,
        title: "Основные принципы защиты",
        contentType: "text",
        textContent: `# Основные принципы защиты

- **Защита в глубину** — множество слоёв защиты
- **Минимизация привилегий** — только необходимые права
- **Разделение обязанностей** — ни один человек не имеет полного контроля`,
        orderIndex: 1,
      },
      // Cybersecurity: section 1 (2 lessons)
      {
        sectionId: cyberSections[1].id,
        title: "Вредоносное программное обеспечение",
        contentType: "text",
        textContent: `# Вредоносное ПО

| Тип | Описание |
|-----|----------|
| Вирусы | Самовоспроизводящийся код |
| Черви | Распространяются через сети |
| Трояны | Маскируются под полезные программы |
| Ransomware | Шифрует данные и требует выкуп |

## Признаки заражения
- Медленная работа, всплывающие окна, необычная активность`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[1].id,
        title: "Фишинг и социальная инженерия",
        contentType: "text",
        textContent: `# Фишинг и социальная инженерия

Человек — самое слабое звено в безопасности.

## Типы фишинга
- **Email-фишинг** — массовые поддельные письма
- **Spear phishing** — целевая атака на конкретного человека
- **Smishing** — через SMS
- **Vishing** — голосовой фишинг

## Признаки фишингового письма
- Срочное требование, ошибки, подозрительный адрес, запрос пароля`,
        orderIndex: 1,
      },
      // Cybersecurity: section 2 (2 lessons)
      {
        sectionId: cyberSections[2].id,
        title: "Симметричное и асимметричное шифрование",
        contentType: "text",
        textContent: `# Симметричное и асимметричное шифрование

## Симметричное (AES, ChaCha20)
- Один ключ для шифрования и дешифрования
- Быстрое, проблема передачи ключа

## Асимметричное (RSA, ECC)
- Пара ключей: публичный и приватный
- Медленнее, безопаснее для обмена

## Хеширование (SHA-256)
- Односторонняя функция для проверки целостности`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[2].id,
        title: "PKI и цифровые подписи",
        contentType: "text",
        textContent: `# PKI и цифровые подписи

PKI — инфраструктура управления цифровыми сертификатами.

## Цифровой сертификат
Содержит: владельца, открытый ключ, издателя (CA), срок действия, подпись CA.

## Цепочка доверия
Корневой CA → Промежуточный CA → Сертификат сервера

## Цифровая подпись
Обеспечивает аутентичность, целостность и неотказуемость.`,
        orderIndex: 1,
      },
      // Cybersecurity: section 3 (2 lessons)
      {
        sectionId: cyberSections[3].id,
        title: "Сетевые экраны (Firewall)",
        contentType: "text",
        textContent: `# Сетевые экраны (Firewall)

Firewall фильтрует трафик по заданным правилам.

## Типы
- **Packet Filter** — L3-L4, фильтрация по IP/портам
- **Stateful** — отслеживает состояние соединений
- **Application (L7)** — анализирует содержимое
- **NGFW** — с IPS, DPI, антивирусом

## DMZ
Отдельная сеть для публичных серверов между внешней и внутренней сетью.`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[3].id,
        title: "IDS/IPS системы",
        contentType: "text",
        textContent: `# IDS/IPS системы

- **IDS** — обнаружение вторжений, сигнализирует
- **IPS** — предотвращение, активно блокирует

## Методы обнаружения
- **Signature-based** — база известных атак
- **Anomaly-based** — отклонения от нормы
- **Heuristic** — анализ поведения`,
        orderIndex: 1,
      },
      // Cybersecurity: section 4 (2 lessons)
      {
        sectionId: cyberSections[4].id,
        title: "Безопасность паролей и 2FA",
        contentType: "text",
        textContent: `# Безопасность паролей и 2FA

## Правила паролей
- Не менее 12 символов
- Буквы + цифры + спецсимволы
- Разные пароли для разных сервисов
- Использовать менеджер паролей

## 2FA/MFA
| Фактор | Пример |
|--------|--------|
| Знание | Пароль |
| Владение | TOTP-код, аппаратный ключ |
| Биометрия | Отпечаток, лицо |

## Хранение на сервере
bcrypt/argon2/scrypt + соль для каждого пароля.`,
        orderIndex: 0,
      },
      {
        sectionId: cyberSections[4].id,
        title: "Резервное копирование",
        contentType: "text",
        textContent: `# Резервное копирование

## Правило 3-2-1
- 3 копии данных
- 2 разных носителя
- 1 копия вне офиса

## Типы бэкапов
- **Full** — полная копия
- **Incremental** — только изменения
- **Differential** — изменения с последнего Full

## RPO и RTO
- **RPO** — допустимая потеря данных во времени
- **RTO** — время на восстановление`,
        orderIndex: 1,
      },
      // Cybersecurity: final exam lesson
      {
        sectionId: cyberSections[4].id,
        title: "Финальный тест",
        contentType: "text",
        textContent: "Проверьте свои знания по курсу \"Основы кибербезопасности\".",
        orderIndex: 2,
      },
    ]);

    await db.insert(schema.lessons).values([
      // Networking: section 0 (2 lessons)
      {
        sectionId: networkingSections[0].id,
        title: "Что такое компьютерная сеть?",
        contentType: "text",
        textContent: `# Что такое компьютерная сеть?

Два или более устройств, соединённых для обмена данными.

## Типы по размеру
- **PAN** — Bluetooth, USB
- **LAN** — дом, офис
- **MAN** — город
- **WAN** — Интернет

## Компоненты
Коммутаторы, маршрутизаторы, кабели, точки доступа`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[0].id,
        title: "Сетевые устройства",
        contentType: "text",
        textContent: `# Сетевые устройства

- **Switch** — L2, соединяет устройства внутри сети по MAC
- **Router** — L3, соединяет сети, передаёт по IP
- **Access Point** — беспроводной доступ
- **Firewall** — фильтрация трафика`,
        orderIndex: 1,
      },
      // Networking: section 1 (2 lessons)
      {
        sectionId: networkingSections[1].id,
        title: "Модель OSI (7 уровней)",
        contentType: "text",
        textContent: `# Модель OSI

| Уровень | Функция | Пример |
|---------|---------|--------|
| 7 — Прикладной | Взаимодействие с приложениями | HTTP, SMTP |
| 6 — Представления | Шифрование, сжатие | SSL/TLS |
| 5 — Сеансовый | Управление сессией | RPC |
| 4 — Транспортный | Надёжная доставка | TCP, UDP |
| 3 — Сетевой | Маршрутизация, IP | IP, Router |
| 2 — Канальный | MAC-адреса, кадры | Ethernet, Switch |
| 1 — Физический | Биты, сигналы | Кабели, Hub |`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[1].id,
        title: "Модель TCP/IP",
        contentType: "text",
        textContent: `# Модель TCP/IP

| Уровень | Протоколы |
|---------|-----------|
| Прикладной | HTTP, DNS, SMTP, SSH |
| Транспортный | TCP, UDP |
| Межсетевой | IP, ICMP |
| Сетевого доступа | Ethernet, Wi-Fi |

## Инкапсуляция
Данные → Сегмент (TCP) → Пакет (IP) → Кадр (Ethernet) → Биты`,
        orderIndex: 1,
      },
      // Networking: section 2 (2 lessons)
      {
        sectionId: networkingSections[2].id,
        title: "IPv4 и IPv6",
        contentType: "text",
        textContent: `# IPv4 и IPv6

## IPv4
- 32 бита, 4 октета — 192.168.1.1
- Частные: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

## IPv6
- 128 бит, 8 групп — 2001:0db8::1
- Адресов хватит каждому устройству`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[2].id,
        title: "Маски подсети и CIDR",
        contentType: "text",
        textContent: `# Маски подсети и CIDR

## Маска подсети
Определяет, какая часть IP — сеть, а какая — узел.
- /24 = 255.255.255.0 = 256 адресов (254 хоста)
- /16 = 255.255.0.0 = 65536 адресов
- /8 = 255.0.0.0 = 16 млн адресов

## CIDR нотация
IP/маска: 192.168.1.0/24 — сеть, 192.168.1.1-254 — хосты, 255 — broadcast`,
        orderIndex: 1,
      },
      // Networking: section 3 (2 lessons)
      {
        sectionId: networkingSections[3].id,
        title: "Статическая и динамическая маршрутизация",
        contentType: "text",
        textContent: `# Маршрутизация

## Статическая
- Администратор вручную прописывает маршруты
- Просто, предсказуемо, не масштабируется

## Динамическая (RIP, OSPF, BGP)
- Маршрутизаторы обмениваются информацией
- Автоматически адаптируются к изменениям
- OSPF — внутри AS, BGP — между AS

## Таблица маршрутизации
\`\`\`
Destination     Gateway         Iface
0.0.0.0/0       10.0.0.1        eth0
10.0.0.0/24     0.0.0.0         eth0
192.168.1.0/24  10.0.0.2        eth1
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[3].id,
        title: "NAT",
        contentType: "text",
        textContent: `# NAT (Network Address Translation)

Преобразует частные IP-адреса в публичные и обратно.

## Типы NAT
| Тип | Описание |
|-----|----------|
| SNAT | Замена source IP при исходящем трафике |
| DNAT | Замена destination IP при входящем трафике |
| PAT | SNAT + порт — один публичный IP для многих клиентов |

## Зачем нужен NAT?
- Экономия IPv4 адресов
- Скрытие внутренней структуры сети`,
        orderIndex: 1,
      },
      // Networking: section 4 (2 lessons)
      {
        sectionId: networkingSections[4].id,
        title: "HTTP/HTTPS",
        contentType: "text",
        textContent: `# HTTP/HTTPS

## HTTP методы
- **GET** — получение данных
- **POST** — создание ресурса
- **PUT** — полное обновление
- **PATCH** — частичное обновление
- **DELETE** — удаление

## Коды ответа
| Диапазон | Значение | Пример |
|----------|----------|--------|
| 1xx | Информационные | 101 Switching Protocols |
| 2xx | Успех | 200 OK, 201 Created |
| 3xx | Перенаправление | 301 Moved, 304 Not Modified |
| 4xx | Ошибка клиента | 400 Bad Request, 404 Not Found |
| 5xx | Ошибка сервера | 500 Internal Server Error |

## HTTPS = HTTP + TLS
Шифрование данных, проверка сертификата сервера, защита от MITM.`,
        orderIndex: 0,
      },
      {
        sectionId: networkingSections[4].id,
        title: "DNS и DHCP",
        contentType: "text",
        textContent: `# DNS и DHCP

## DNS (Domain Name System)
Преобразует доменные имена в IP-адреса.

**Запрос:** example.com → **Ответ:** 93.184.216.34

### Типы записей
- **A** — IPv4 адрес
- **AAAA** — IPv6 адрес
- **CNAME** — алиас (псевдоним)
- **MX** — почтовый сервер
- **TXT** — текстовая информация

## DHCP (Dynamic Host Configuration Protocol)
Автоматически назначает IP-адрес, маску, шлюз, DNS клиентам.

**Процесс:** Discover → Offer → Request → Acknowledge`,
        orderIndex: 1,
      },
      // Networking: final exam lesson
      {
        sectionId: networkingSections[4].id,
        title: "Финальный тест",
        contentType: "text",
        textContent: "Проверьте свои знания по курсу \"Компьютерные сети и протоколы\".",
        orderIndex: 2,
      },
    ]);

    await db.insert(schema.lessons).values([
      // Programming: section 0 (2 lessons)
      {
        sectionId: programmingSections[0].id,
        title: "Python тіліне кіріспе",
        contentType: "text",
        textContent: `# Python тіліне кіріспе

Python — қарапайым және оқуға оңай бағдарламалау тілі.

## Бірінші бағдарлама
\`\`\`python
print("Сәлем, әлем!")
\`\`\`

## Пікірлер
\`\`\`python
# Бір жолды пікір
""" Көп жолды пікір """
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[0].id,
        title: "Айнымалылар және деректер түрлері",
        contentType: "text",
        textContent: `# Айнымалылар және деректер түрлері

\`\`\`python
аты = "Асан"       # str
жасы = 20          # int
баға = 12.5        # float
белсенді = True    # bool
\`\`\`

## Негізгі түрлері
| Түрі | Мысал |
|------|-------|
| int | 10, -5 |
| float | 3.14 |
| str | "Hello" |
| bool | True, False |`,
        orderIndex: 1,
      },
      // Programming: section 1 (2 lessons)
      {
        sectionId: programmingSections[1].id,
        title: "if, elif, else шарт операторлары",
        contentType: "text",
        textContent: `# Шарт операторлары

\`\`\`python
жас = 18
if жас >= 18:
    print("Кәмелетке толған")

баға = 85
if баға >= 90:
    деңгей = "A"
elif баға >= 75:
    деңгей = "B"
else:
    деңгей = "C"
\`\`\`

## Логикалық операторлар
- \`and\` — екеуі де ақиқат
- \`or\` — біреуі ақиқат
- \`not\` — керісінше`,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[1].id,
        title: "Логикалық операторлар және тернарлық өрнек",
        contentType: "text",
        textContent: `# Логикалық операторлар

\`\`\`python
# and — екі шарт та орындалуы керек
if жас >= 18 and жас <= 60:
    print("Жұмыс жасы")

# or — біреуі орындалса жеткілікті
if тіл == "kk" or тіл == "ru":
    print("Отандық пайдаланушы")

# not — терістеу
if not белсенді:
    print("Пайдаланушы белсенді емес")
\`\`\`

## Тернарлық оператор
\`\`\`python
статус = "Үлкен" if жас >= 18 else "Кіші"
\`\`\``,
        orderIndex: 1,
      },
      // Programming: section 2 (2 lessons)
      {
        sectionId: programmingSections[2].id,
        title: "for және while циклдері",
        contentType: "text",
        textContent: `# Циклдер

\`\`\`python
# for
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

аттар = ["Асан", "Ұлан"]
for ат in аттар:
    print(f"Қош келдің, {ат}!")

# while
санау = 0
while санау < 3:
    print(санау)
    санау += 1

# break / continue
for i in range(10):
    if i == 3: continue
    if i == 7: break
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[2].id,
        title: "range() және enumerate()",
        contentType: "text",
        textContent: `# range() және enumerate()

\`\`\`python
# range(басы, соңы, қадам)
for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8

# enumerate — индекс және мән
тізім = ["а", "б", "в"]
for индекс, мән in enumerate(тізім):
    print(индекс, мән)  # 0 а, 1 б, 2 в

# Кірістірілген циклдер
for i in range(3):
    for j in range(3):
        print(i, j)
\`\`\``,
        orderIndex: 1,
      },
      // Programming: section 3 (2 lessons)
      {
        sectionId: programmingSections[3].id,
        title: "Функциялар",
        contentType: "text",
        textContent: `# Функциялар

\`\`\`python
def сәлем_беру(ат):
    print(f"Сәлем, {ат}!")

def қосу(a, b):
    return a + b

# Default параметр
def қош_келдің(ат, тіл="kk"):
    if тіл == "kk":
        print(f"Қош келдің, {ат}!")
    else:
        print(f"Welcome, {ат}!")
\`\`\`

## Негізгі ережелер
- def арқылы анықталады
- return мән қайтарады
- Default параметрлер соңында тұрады`,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[3].id,
        title: "Аргументтердің түрлері",
        contentType: "text",
        textContent: `# Аргументтердің түрлері

\`\`\`python
# Позициялық аргументтер
def қосу(a, b): return a + b
қосу(5, 3)

# Кілттік аргументтер
def профиль(аты, жасы=0):
    print(аты, жасы)
профиль(аты="Асан", жасы=20)

# *args — кез келген сандағы аргументтер
def қосу_көп(*сандар):
    return sum(сандар)
print(қосу_көп(1, 2, 3, 4))  # 10

# **kwargs — кілттік аргументтер сөздігі
def баспа(**мәліметтер):
    for кілт, мән in мәліметтер.items():
        print(кілт, мән)
баспа(аты="Асан", жасы=20, қала="Алматы")
\`\`\``,
        orderIndex: 1,
      },
      // Programming: section 4 (2 lessons)
      {
        sectionId: programmingSections[4].id,
        title: "Файлдармен жұмыс",
        contentType: "text",
        textContent: `# Файлдармен жұмыс

\`\`\`python
# Файлды оқу
with open("məтін.txt", "r", encoding="utf-8") as f:
    мазмұны = f.read()
    print(мазмұны)

# Жолдар бойынша оқу
with open("məтін.txt", "r") as f:
    for жол in f:
        print(жол.strip())

# Файлға жазу
with open("шығу.txt", "w", encoding="utf-8") as f:
    f.write("Сәлем, әлем!\n")
    f.write("Екінші жол\n")

# Қосу (append)
with open("журнал.log", "a") as f:
    f.write("Жаңа жазба\n")
\`\`\`

## Режимдер
- \`"r"\` — оқу
- \`"w"\` — жазу (үстінен жазады)
- \`"a"\` — қосу
- \`"r+"\` — оқу және жазу`,
        orderIndex: 0,
      },
      {
        sectionId: programmingSections[4].id,
        title: "CSV файлдар және json",
        contentType: "text",
        textContent: `# CSV және JSON

## CSV оқу
\`\`\`python
import csv

# Оқу
with open("data.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for жол in reader:
        print(жол)  # ['Асан', '20']

# DictReader
with open("data.csv", newline="") as f:
    reader = csv.DictReader(f)
    for жол in reader:
        print(жол["аты"], жол["жасы"])

# Жазу
with open("шығу.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Аты", "Жасы"])
    writer.writerow(["Асан", 20])
\`\`\`

## JSON (кіріспе)
\`\`\`python
import json

# Сөздікті JSON-ға айналдыру
мәлімет = {"аты": "Асан", "жасы": 20}
json_мәтін = json.dumps(мәлімет, ensure_ascii=False)
print(json_мәтін)  # {"аты": "Асан", "жасы": 20}

# JSON-ды сөздікке айналдыру
қайта = json.loads(json_мәтін)
print(қайта["аты"])  # Асан
\`\`\``,
        orderIndex: 1,
      },
      // Programming: final exam lesson
      {
        sectionId: programmingSections[4].id,
        title: "Қорытынды тест",
        contentType: "text",
        textContent: "Python бағдарламалау курсы бойынша біліміңізді тексеріңіз.",
        orderIndex: 2,
      },
    ]);

    await db.insert(schema.lessons).values([
      // Web security: section 1 (2 lessons)
      {
        sectionId: webSecSection1.id,
        title: "OWASP Top 10: основные угрозы",
        contentType: "text",
        textContent: `# OWASP Top 10

1. Broken Access Control — нарушение прав доступа
2. Cryptographic Failures — слабое шифрование
3. Injection — SQL, NoSQL, OS Command
4. Insecure Design — ошибки архитектуры
5. Security Misconfiguration — неверная конфигурация
6. Vulnerable Components — устаревшие библиотеки
7. Authentication Failures — слабая аутентификация
8. Integrity Failures — нарушение целостности
9. Logging Failures — отсутствие мониторинга
10. SSRF — подделка запросов на сервере`,
        orderIndex: 0,
      },
      {
        sectionId: webSecSection1.id,
        title: "XSS и CSRF атаки",
        contentType: "text",
        textContent: `# XSS и CSRF

## XSS (Cross-Site Scripting)
Внедрение JavaScript кода на страницу.

| Тип | Описание |
|-----|----------|
| Reflected | Код в URL, сразу выполняется |
| Stored | Код сохраняется в БД |
| DOM-based | Уязвимость на стороне клиента |

**Защита:** экранирование вывода, CSP, HttpOnly куки

## CSRF (Cross-Site Request Forgery)
Атакующий заставляет жертву выполнить действие на сайте, где она аутентифицирована.

**Защита:** CSRF-токены, SameSite куки`,
        orderIndex: 1,
      },
      // Web security: section 2 (2 lessons)
      {
        sectionId: webSecSection2.id,
        title: "SQL-инъекции: виды и защита",
        contentType: "text",
        textContent: `# SQL-инъекции

Внедрение SQL-кода через пользовательский ввод.

## Пример
\`\`\`sql
SELECT * FROM users WHERE login = 'admin' AND pass = '' OR '1'='1'
\`\`\`

## Виды SQL-инъекций
| Тип | Описание |
|-----|----------|
| In-band | Данные в том же канале (UNION SELECT) |
| Blind | По косвенным признакам (true/false) |
| Out-of-band | Через другой канал (DNS, HTTP) |

## Защита
- Параметризованные запросы (Prepared Statements)
- ORM (Prisma, Drizzle, TypeORM)
- Минимизация прав БД`,
        orderIndex: 0,
      },
      {
        sectionId: webSecSection2.id,
        title: "Практика: SQL-инъекции в Node.js",
        contentType: "text",
        textContent: `# SQL-инъекции в Node.js

## Уязвимый код
\`\`\`javascript
// НИКОГДА так не делайте!
const query = \`SELECT * FROM users WHERE email = '\${email}'\`
\`\`\`

При вводе \`admin' --\` запрос станет:
\`\`\`sql
SELECT * FROM users WHERE email = 'admin' --'
\`\`\`

## Безопасный код
\`\`\`javascript
// Параметризованный запрос
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
)

// С ORM (Drizzle)
const user = await db.query.users.findFirst({
  where: eq(users.email, email)
})
\`\`\`

## Экранирование vs Параметризация
- Экранировать спецсимволы НЕДОСТАТОЧНО
- Только параметризованные запросы дают 100% защиту`,
        orderIndex: 1,
      },
      // Web security: section 3 (2 lessons)
      {
        sectionId: webSecSection3.id,
        title: "Безопасность REST API",
        contentType: "text",
        textContent: `# Безопасность REST API

## Аутентификация и авторизация
- JWT с коротким сроком жизни (access + refresh)
- Хранить секреты в env, не в коде
- Rate limiting на каждый endpoint
- Проверка ролей на каждый запрос

## Rate Limiting
Ограничение числа запросов с одного IP или пользователя.

**Пример:** 10 попыток входа за 15 минут.

## Input Validation
- Валидация всех входных данных (Zod, Joi)
- Не доверять user input
- Белый список разрешённых значений

## CORS
\`\`\`javascript
// Разрешить только ваш фронтенд
app.use(cors({
  origin: 'https://netcourse.tech'
}))
\`\`\``,
        orderIndex: 0,
      },
      {
        sectionId: webSecSection3.id,
        title: "Логирование и мониторинг",
        contentType: "text",
        textContent: `# Логирование и мониторинг

## Что логировать
- Все попытки аутентификации (успешные и неуспешные)
- Изменения прав доступа
- Ошибки валидации и 4xx/5xx ответы
- Доступ к чувствительным данным

## Чего НЕ логировать
- Пароли, токены, секреты
- Персональные данные в открытом виде

## Best practices
- Централизованное логирование (ELK, Grafana Loki)
- Оповещения об аномалиях
- Регулярный аудит логов`,
        orderIndex: 1,
      },
      // Web security: final exam lesson
      {
        sectionId: webSecSection3.id,
        title: "Финальный тест",
        contentType: "text",
        textContent: "Проверьте свои знания по курсу \"Основы веб-безопасности\".",
        orderIndex: 2,
      },
    ]);

    await db.insert(schema.lessons).values([
      // Mid-course quizzes (section 2 for most, section 1 for web security)
      { sectionId: cyberSections[2].id, title: "Промежуточный тест", contentType: "text", textContent: "Проверьте знания по криптографии и шифрованию.", orderIndex: 2 },
      { sectionId: networkingSections[2].id, title: "Промежуточный тест", contentType: "text", textContent: "Проверьте знания по IP-адресации.", orderIndex: 2 },
      { sectionId: programmingSections[2].id, title: "Аралық тест", contentType: "text", textContent: "Циклдер тақырыбы бойынша біліміңізді тексеріңіз.", orderIndex: 2 },
      { sectionId: webSecSection2.id, title: "Промежуточный тест", contentType: "text", textContent: "Проверьте знания по SQL-инъекциям.", orderIndex: 2 },
    ]);

    console.log("Added 45 lessons");

    const finalLessons = await db.select().from(schema.lessons).where(
      and(
        inArray(schema.lessons.sectionId, [
          cyberSections[4].id,
          networkingSections[4].id,
          programmingSections[4].id,
          webSecSection3.id,
        ]),
        inArray(schema.lessons.title, ["Финальный тест", "Қорытынды тест"]),
      )
    );

    const [cyberFinalLesson, networkingFinalLesson, programmingFinalLesson, webSecFinalLesson] = finalLessons;

    const allQuizzes = await db.insert(schema.quizzes).values([
      { lessonId: cyberFinalLesson.id, title: "Финальный тест по кибербезопасности" },
      { lessonId: networkingFinalLesson.id, title: "Финальный тест по компьютерным сетям" },
      { lessonId: programmingFinalLesson.id, title: "Python бағдарламалау — қорытынды тест" },
      { lessonId: webSecFinalLesson.id, title: "Финальный тест по веб-безопасности" },
    ]).returning();

    const [cyberQuiz, networkingQuiz, programmingQuiz, webSecQuiz] = allQuizzes;

    const allQuestions = await db.insert(schema.questions).values([
      // Cybersecurity quiz
      { quizId: cyberQuiz.id, questionText: "Что из перечисленного НЕ является частью CIA Triad?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Какой тип вредоносного ПО шифрует данные и требует выкуп?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Что такое фишинг?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Какой алгоритм является симметричным?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Что такое PKI?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Какой уровень модели OSI отвечает за маршрутизацию?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Что такое DMZ?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "IDS отличается от IPS тем, что:", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Какой протокол используется для защиты email?", questionType: "single" },
      { quizId: cyberQuiz.id, questionText: "Какой хеш является наиболее рекомендуемым для хранения паролей?", questionType: "single" },

      // Networking quiz
      { quizId: networkingQuiz.id, questionText: "Сколько уровней в модели OSI?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой протокол работает на транспортном уровне?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какую маску подсети имеет префикс /24?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой тип NAT позволяет использовать один публичный IP для нескольких клиентов?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой протокол отвечает за преобразование доменных имен в IP-адреса?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой порт используется для HTTPS по умолчанию?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой протокол автоматически назначает IP-адреса?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Сколько бит в IPv6 адресе?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой метод HTTP используется для создания ресурса?", questionType: "single" },
      { quizId: networkingQuiz.id, questionText: "Какой протокол используется для динамической маршрутизации внутри AS?", questionType: "single" },

      // Programming quiz
      { quizId: programmingQuiz.id, questionText: "Python-да мәтінді қандай функция шығарады?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "3.14 мәнінің дерек түрі қандай?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Теңдікті тексеру үшін қандай оператор қолданылады?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Циклдегі continue операторы не істейді?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Python-да функцияны қалай жариялайды?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Функция return болмаса, не қайтарады?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Файлдың соңына деректерді қосу үшін қандай режим қажет?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Python-да *args деген не?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Тізім элементінің индексі мен мәнін қайтаратын функция?", questionType: "single" },
      { quizId: programmingQuiz.id, questionText: "Python-да CSV-мен жұмыс істеу үшін қандай модуль қолданылады?", questionType: "single" },

      // Web security quiz
      { quizId: webSecQuiz.id, questionText: "Что такое XSS?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какая атака использует аутентифицированную сессию жертвы?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какая защита наиболее эффективна против SQL-инъекций?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какой тип XSS сохраняется в базе данных?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Что такое CSRF-токен?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какой заголовок HTTP защищает от XSS?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какая уязвимость стоит на первом месте в OWASP Top 10?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Что такое Rate Limiting?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Какой метод HTTP является идемпотентным?", questionType: "single" },
      { quizId: webSecQuiz.id, questionText: "Чего НЕ следует логировать?", questionType: "single" },
    ]).returning();

    const q = allQuestions;

    await db.insert(schema.answers).values([
      // Cybersecurity quiz answers (q0-q9)
      { questionId: q[0].id, answerText: "Конфиденциальность", isCorrect: false },
      { questionId: q[0].id, answerText: "Целостность", isCorrect: false },
      { questionId: q[0].id, answerText: "Автоматизация", isCorrect: true },
      { questionId: q[0].id, answerText: "Доступность", isCorrect: false },

      { questionId: q[1].id, answerText: "Вирус", isCorrect: false },
      { questionId: q[1].id, answerText: "Ransomware", isCorrect: true },
      { questionId: q[1].id, answerText: "Троян", isCorrect: false },
      { questionId: q[1].id, answerText: "Червь", isCorrect: false },

      { questionId: q[2].id, answerText: "Атака на сетевой протокол", isCorrect: false },
      { questionId: q[2].id, answerText: "Метод социальной инженерии для кражи данных", isCorrect: true },
      { questionId: q[2].id, answerText: "Тип вредоносного ПО", isCorrect: false },
      { questionId: q[2].id, answerText: "Метод шифрования", isCorrect: false },

      { questionId: q[3].id, answerText: "RSA", isCorrect: false },
      { questionId: q[3].id, answerText: "ECC", isCorrect: false },
      { questionId: q[3].id, answerText: "AES", isCorrect: true },
      { questionId: q[3].id, answerText: "SHA-256", isCorrect: false },

      { questionId: q[4].id, answerText: "Инфраструктура управления цифровыми сертификатами", isCorrect: true },
      { questionId: q[4].id, answerText: "Протокол шифрования", isCorrect: false },
      { questionId: q[4].id, answerText: "Тип брандмауэра", isCorrect: false },
      { questionId: q[4].id, answerText: "Метод аутентификации", isCorrect: false },

      { questionId: q[5].id, answerText: "Физический", isCorrect: false },
      { questionId: q[5].id, answerText: "Канальный", isCorrect: false },
      { questionId: q[5].id, answerText: "Сетевой", isCorrect: true },
      { questionId: q[5].id, answerText: "Транспортный", isCorrect: false },

      { questionId: q[6].id, answerText: "Метод шифрования", isCorrect: false },
      { questionId: q[6].id, answerText: "Демилитаризованная зона между сетями", isCorrect: true },
      { questionId: q[6].id, answerText: "Тип маршрутизатора", isCorrect: false },
      { questionId: q[6].id, answerText: "Протокол безопасности", isCorrect: false },

      { questionId: q[7].id, answerText: "IDS дешевле", isCorrect: false },
      { questionId: q[7].id, answerText: "IDS только обнаруживает, IPS еще и блокирует", isCorrect: true },
      { questionId: q[7].id, answerText: "IPS работает быстрее", isCorrect: false },
      { questionId: q[7].id, answerText: "IPS не требует настройки", isCorrect: false },

      { questionId: q[8].id, answerText: "SMTP over TLS", isCorrect: true },
      { questionId: q[8].id, answerText: "HTTP", isCorrect: false },
      { questionId: q[8].id, answerText: "FTP", isCorrect: false },
      { questionId: q[8].id, answerText: "SNMP", isCorrect: false },

      { questionId: q[9].id, answerText: "MD5", isCorrect: false },
      { questionId: q[9].id, answerText: "SHA-1", isCorrect: false },
      { questionId: q[9].id, answerText: "SHA-256", isCorrect: false },
      { questionId: q[9].id, answerText: "bcrypt", isCorrect: true },

      // Networking quiz answers (q10-q19)
      { questionId: q[10].id, answerText: "5", isCorrect: false },
      { questionId: q[10].id, answerText: "7", isCorrect: true },
      { questionId: q[10].id, answerText: "4", isCorrect: false },
      { questionId: q[10].id, answerText: "6", isCorrect: false },

      { questionId: q[11].id, answerText: "HTTP", isCorrect: false },
      { questionId: q[11].id, answerText: "IP", isCorrect: false },
      { questionId: q[11].id, answerText: "TCP", isCorrect: true },
      { questionId: q[11].id, answerText: "Ethernet", isCorrect: false },

      { questionId: q[12].id, answerText: "255.0.0.0", isCorrect: false },
      { questionId: q[12].id, answerText: "255.255.0.0", isCorrect: false },
      { questionId: q[12].id, answerText: "255.255.255.0", isCorrect: true },
      { questionId: q[12].id, answerText: "255.255.255.255", isCorrect: false },

      { questionId: q[13].id, answerText: "SNAT", isCorrect: false },
      { questionId: q[13].id, answerText: "DNAT", isCorrect: false },
      { questionId: q[13].id, answerText: "PAT", isCorrect: true },
      { questionId: q[13].id, answerText: "NATP", isCorrect: false },

      { questionId: q[14].id, answerText: "DHCP", isCorrect: false },
      { questionId: q[14].id, answerText: "DNS", isCorrect: true },
      { questionId: q[14].id, answerText: "ARP", isCorrect: false },
      { questionId: q[14].id, answerText: "SNMP", isCorrect: false },

      { questionId: q[15].id, answerText: "80", isCorrect: false },
      { questionId: q[15].id, answerText: "443", isCorrect: true },
      { questionId: q[15].id, answerText: "8080", isCorrect: false },
      { questionId: q[15].id, answerText: "8443", isCorrect: false },

      { questionId: q[16].id, answerText: "DNS", isCorrect: false },
      { questionId: q[16].id, answerText: "DHCP", isCorrect: true },
      { questionId: q[16].id, answerText: "ARP", isCorrect: false },
      { questionId: q[16].id, answerText: "ICMP", isCorrect: false },

      { questionId: q[17].id, answerText: "32", isCorrect: false },
      { questionId: q[17].id, answerText: "64", isCorrect: false },
      { questionId: q[17].id, answerText: "128", isCorrect: true },
      { questionId: q[17].id, answerText: "256", isCorrect: false },

      { questionId: q[18].id, answerText: "GET", isCorrect: false },
      { questionId: q[18].id, answerText: "POST", isCorrect: true },
      { questionId: q[18].id, answerText: "PUT", isCorrect: false },
      { questionId: q[18].id, answerText: "DELETE", isCorrect: false },

      { questionId: q[19].id, answerText: "RIP", isCorrect: false },
      { questionId: q[19].id, answerText: "BGP", isCorrect: false },
      { questionId: q[19].id, answerText: "OSPF", isCorrect: true },
      { questionId: q[19].id, answerText: "IGMP", isCorrect: false },

      // Programming quiz answers (q20-q29)
      { questionId: q[20].id, answerText: "output()", isCorrect: false },
      { questionId: q[20].id, answerText: "print()", isCorrect: true },
      { questionId: q[20].id, answerText: "echo()", isCorrect: false },
      { questionId: q[20].id, answerText: "console.log()", isCorrect: false },

      { questionId: q[21].id, answerText: "int", isCorrect: false },
      { questionId: q[21].id, answerText: "float", isCorrect: true },
      { questionId: q[21].id, answerText: "str", isCorrect: false },
      { questionId: q[21].id, answerText: "bool", isCorrect: false },

      { questionId: q[22].id, answerText: "=", isCorrect: false },
      { questionId: q[22].id, answerText: "==", isCorrect: true },
      { questionId: q[22].id, answerText: "!=", isCorrect: false },
      { questionId: q[22].id, answerText: ":=", isCorrect: false },

      { questionId: q[23].id, answerText: "Циклды аяқтайды", isCorrect: false },
      { questionId: q[23].id, answerText: "Келесі итерацияға өтеді", isCorrect: true },
      { questionId: q[23].id, answerText: "Келесі итерацияны өткізіп жібереді", isCorrect: false },
      { questionId: q[23].id, answerText: "Ешнәрсе істемейді", isCorrect: false },

      { questionId: q[24].id, answerText: "function", isCorrect: false },
      { questionId: q[24].id, answerText: "def", isCorrect: true },
      { questionId: q[24].id, answerText: "define", isCorrect: false },
      { questionId: q[24].id, answerText: "func", isCorrect: false },

      { questionId: q[25].id, answerText: "0", isCorrect: false },
      { questionId: q[25].id, answerText: "None", isCorrect: true },
      { questionId: q[25].id, answerText: "Бос жол", isCorrect: false },
      { questionId: q[25].id, answerText: "Қате", isCorrect: false },

      { questionId: q[26].id, answerText: "r", isCorrect: false },
      { questionId: q[26].id, answerText: "w", isCorrect: false },
      { questionId: q[26].id, answerText: "a", isCorrect: true },
      { questionId: q[26].id, answerText: "r+", isCorrect: false },

      { questionId: q[27].id, answerText: "Кілттік аргументтер", isCorrect: false },
      { questionId: q[27].id, answerText: "Кез келген сандағы позициялық аргументтер", isCorrect: true },
      { questionId: q[27].id, answerText: "Кез келген сандағы кілттік аргументтер", isCorrect: false },
      { questionId: q[27].id, answerText: "Әдепкі аргументтер", isCorrect: false },

      { questionId: q[28].id, answerText: "range()", isCorrect: false },
      { questionId: q[28].id, answerText: "enumerate()", isCorrect: true },
      { questionId: q[28].id, answerText: "zip()", isCorrect: false },
      { questionId: q[28].id, answerText: "map()", isCorrect: false },

      { questionId: q[29].id, answerText: "csv", isCorrect: true },
      { questionId: q[29].id, answerText: "json", isCorrect: false },
      { questionId: q[29].id, answerText: "excel", isCorrect: false },
      { questionId: q[29].id, answerText: "io", isCorrect: false },

      // Web security quiz answers (q30-q39)
      { questionId: q[30].id, answerText: "Атака на базу данных", isCorrect: false },
      { questionId: q[30].id, answerText: "Межсайтовый скриптинг", isCorrect: true },
      { questionId: q[30].id, answerText: "Атака на протокол", isCorrect: false },
      { questionId: q[30].id, answerText: "Фишинг", isCorrect: false },

      { questionId: q[31].id, answerText: "XSS", isCorrect: false },
      { questionId: q[31].id, answerText: "CSRF", isCorrect: true },
      { questionId: q[31].id, answerText: "SQL-инъекция", isCorrect: false },
      { questionId: q[31].id, answerText: "SSRF", isCorrect: false },

      { questionId: q[32].id, answerText: "Экранирование спецсимволов", isCorrect: false },
      { questionId: q[32].id, answerText: "Параметризованные запросы", isCorrect: true },
      { questionId: q[32].id, answerText: "Валидация на клиенте", isCorrect: false },
      { questionId: q[32].id, answerText: "HTTPS", isCorrect: false },

      { questionId: q[33].id, answerText: "Reflected XSS", isCorrect: false },
      { questionId: q[33].id, answerText: "Stored XSS", isCorrect: true },
      { questionId: q[33].id, answerText: "DOM-based XSS", isCorrect: false },
      { questionId: q[33].id, answerText: "Self XSS", isCorrect: false },

      { questionId: q[34].id, answerText: "Токен для защиты от CSRF", isCorrect: true },
      { questionId: q[34].id, answerText: "Токен для аутентификации", isCorrect: false },
      { questionId: q[34].id, answerText: "Токен для шифрования", isCorrect: false },
      { questionId: q[34].id, answerText: "Токен для логирования", isCorrect: false },

      { questionId: q[35].id, answerText: "X-Frame-Options", isCorrect: false },
      { questionId: q[35].id, answerText: "Content-Security-Policy", isCorrect: true },
      { questionId: q[35].id, answerText: "Strict-Transport-Security", isCorrect: false },
      { questionId: q[35].id, answerText: "X-Content-Type-Options", isCorrect: false },

      { questionId: q[36].id, answerText: "Broken Access Control", isCorrect: true },
      { questionId: q[36].id, answerText: "Injection", isCorrect: false },
      { questionId: q[36].id, answerText: "Cryptographic Failures", isCorrect: false },
      { questionId: q[36].id, answerText: "XSS", isCorrect: false },

      { questionId: q[37].id, answerText: "Шифрование данных", isCorrect: false },
      { questionId: q[37].id, answerText: "Ограничение числа запросов с одного IP/пользователя", isCorrect: true },
      { questionId: q[37].id, answerText: "Балансировка нагрузки", isCorrect: false },
      { questionId: q[37].id, answerText: "Кэширование ответов", isCorrect: false },

      { questionId: q[38].id, answerText: "POST", isCorrect: false },
      { questionId: q[38].id, answerText: "GET", isCorrect: true },
      { questionId: q[38].id, answerText: "PATCH", isCorrect: false },
      { questionId: q[38].id, answerText: "DELETE", isCorrect: false },

      { questionId: q[39].id, answerText: "Коды 4xx и 5xx", isCorrect: false },
      { questionId: q[39].id, answerText: "Пароли и токены", isCorrect: true },
      { questionId: q[39].id, answerText: "Попытки входа", isCorrect: false },
      { questionId: q[39].id, answerText: "Изменения прав", isCorrect: false },
    ]);

    const midLessonIds = [
      cyberSections[2].id,
      networkingSections[2].id,
      programmingSections[2].id,
      webSecSection2.id,
    ];

    const midLessons = await db.select().from(schema.lessons).where(
      and(
        inArray(schema.lessons.sectionId, midLessonIds),
        inArray(schema.lessons.title, ["Промежуточный тест", "Аралық тест"]),
      )
    );

    const [cyberMidLesson, networkingMidLesson, programmingMidLesson, webSecMidLesson] = midLessons;

    const midQuizzes = await db.insert(schema.quizzes).values([
      { lessonId: cyberMidLesson.id, title: "Промежуточный тест: криптография" },
      { lessonId: networkingMidLesson.id, title: "Промежуточный тест: IP-адресация" },
      { lessonId: programmingMidLesson.id, title: "Аралық тест: циклдер" },
      { lessonId: webSecMidLesson.id, title: "Промежуточный тест: SQL-инъекции" },
    ]).returning();

    const [cyberMidQuiz, networkingMidQuiz, programmingMidQuiz, webSecMidQuiz] = midQuizzes;

    const midQuestions = await db.insert(schema.questions).values([
      // Cyber mid: cryptography
      { quizId: cyberMidQuiz.id, questionText: "Какой тип шифрования использует один ключ для шифрования и дешифрования?", questionType: "single" },
      { quizId: cyberMidQuiz.id, questionText: "Какой алгоритм является асимметричным?", questionType: "single" },
      { quizId: cyberMidQuiz.id, questionText: "Что такое хеш-функция?", questionType: "single" },
      { quizId: cyberMidQuiz.id, questionText: "Для чего используется цифровая подпись?", questionType: "single" },
      { quizId: cyberMidQuiz.id, questionText: "Что такое Certificate Authority (CA)?", questionType: "single" },

      // Networking mid: IP addressing
      { quizId: networkingMidQuiz.id, questionText: "Сколько октетов в IPv4 адресе?", questionType: "single" },
      { quizId: networkingMidQuiz.id, questionText: "Какой адрес является широковещательным (broadcast) для сети 192.168.1.0/24?", questionType: "single" },
      { quizId: networkingMidQuiz.id, questionText: "Что такое NAT?", questionType: "single" },
      { quizId: networkingMidQuiz.id, questionText: "Какой класс адресов соответствует диапазону 192.168.0.0/16?", questionType: "single" },
      { quizId: networkingMidQuiz.id, questionText: "Сколько хостов можно разместить в сети /24?", questionType: "single" },

      // Programming mid: cycles (in Kazakh)
      { quizId: programmingMidQuiz.id, questionText: "Циклдің неше түрі бар?", questionType: "single" },
      { quizId: programmingMidQuiz.id, questionText: "for циклінде range(5) неше рет орындалады?", questionType: "single" },
      { quizId: programmingMidQuiz.id, questionText: "break операторы не істейді?", questionType: "single" },
      { quizId: programmingMidQuiz.id, questionText: "while циклі қай кезде тоқтайды?", questionType: "single" },
      { quizId: programmingMidQuiz.id, questionText: "Кірістірілген цикл дегеніміз не?", questionType: "single" },

      // Web security mid: SQL injections
      { quizId: webSecMidQuiz.id, questionText: "Что такое SQL-инъекция?", questionType: "single" },
      { quizId: webSecMidQuiz.id, questionText: "Какой тип SQL-инъекции не видит прямого вывода данных?", questionType: "single" },
      { quizId: webSecMidQuiz.id, questionText: "Что такое Prepared Statement?", questionType: "single" },
      { quizId: webSecMidQuiz.id, questionText: "Какая ORM используется в этом проекте для защиты от SQL-инъекций?", questionType: "single" },
      { quizId: webSecMidQuiz.id, questionText: "Достаточно ли экранирования спецсимволов для защиты от SQL-инъекций?", questionType: "single" },
    ]).returning();

    const mq = midQuestions;

    await db.insert(schema.answers).values([
      // Cyber mid answers (mq0-mq4)
      { questionId: mq[0].id, answerText: "Асимметричное", isCorrect: false },
      { questionId: mq[0].id, answerText: "Симметричное", isCorrect: true },
      { questionId: mq[0].id, answerText: "Квантовое", isCorrect: false },
      { questionId: mq[0].id, answerText: "Поточное", isCorrect: false },

      { questionId: mq[1].id, answerText: "AES", isCorrect: false },
      { questionId: mq[1].id, answerText: "ChaCha20", isCorrect: false },
      { questionId: mq[1].id, answerText: "RSA", isCorrect: true },
      { questionId: mq[1].id, answerText: "SHA-256", isCorrect: false },

      { questionId: mq[2].id, answerText: "Шифрование данных", isCorrect: false },
      { questionId: mq[2].id, answerText: "Одностороннее преобразование данных", isCorrect: true },
      { questionId: mq[2].id, answerText: "Сжатие данных", isCorrect: false },
      { questionId: mq[2].id, answerText: "Кодирование данных", isCorrect: false },

      { questionId: mq[3].id, answerText: "Для шифрования трафика", isCorrect: false },
      { questionId: mq[3].id, answerText: "Для подтверждения авторства и целостности", isCorrect: true },
      { questionId: mq[3].id, answerText: "Для сжатия данных", isCorrect: false },
      { questionId: mq[3].id, answerText: "Для аутентификации по паролю", isCorrect: false },

      { questionId: mq[4].id, answerText: "Организация, выпускающая цифровые сертификаты", isCorrect: true },
      { questionId: mq[4].id, answerText: "Тип брандмауэра", isCorrect: false },
      { questionId: mq[4].id, answerText: "Алгоритм шифрования", isCorrect: false },
      { questionId: mq[4].id, answerText: "Сетевой протокол", isCorrect: false },

      // Networking mid answers (mq5-mq9)
      { questionId: mq[5].id, answerText: "2", isCorrect: false },
      { questionId: mq[5].id, answerText: "3", isCorrect: false },
      { questionId: mq[5].id, answerText: "4", isCorrect: true },
      { questionId: mq[5].id, answerText: "6", isCorrect: false },

      { questionId: mq[6].id, answerText: "192.168.1.0", isCorrect: false },
      { questionId: mq[6].id, answerText: "192.168.1.255", isCorrect: true },
      { questionId: mq[6].id, answerText: "255.255.255.0", isCorrect: false },
      { questionId: mq[6].id, answerText: "192.168.1.1", isCorrect: false },

      { questionId: mq[7].id, answerText: "Протокол шифрования", isCorrect: false },
      { questionId: mq[7].id, answerText: "Преобразование частных IP в публичные", isCorrect: true },
      { questionId: mq[7].id, answerText: "Тип маршрутизации", isCorrect: false },
      { questionId: mq[7].id, answerText: "Метод аутентификации", isCorrect: false },

      { questionId: mq[8].id, answerText: "Class A", isCorrect: false },
      { questionId: mq[8].id, answerText: "Class B", isCorrect: false },
      { questionId: mq[8].id, answerText: "Class C", isCorrect: true },
      { questionId: mq[8].id, answerText: "Class D", isCorrect: false },

      { questionId: mq[9].id, answerText: "128", isCorrect: false },
      { questionId: mq[9].id, answerText: "256", isCorrect: false },
      { questionId: mq[9].id, answerText: "254", isCorrect: true },
      { questionId: mq[9].id, answerText: "512", isCorrect: false },

      // Programming mid answers (mq10-mq14, in Kazakh)
      { questionId: mq[10].id, answerText: "1", isCorrect: false },
      { questionId: mq[10].id, answerText: "2", isCorrect: true },
      { questionId: mq[10].id, answerText: "3", isCorrect: false },
      { questionId: mq[10].id, answerText: "4", isCorrect: false },

      { questionId: mq[11].id, answerText: "4", isCorrect: false },
      { questionId: mq[11].id, answerText: "5", isCorrect: true },
      { questionId: mq[11].id, answerText: "6", isCorrect: false },
      { questionId: mq[11].id, answerText: "10", isCorrect: false },

      { questionId: mq[12].id, answerText: "Циклді жалғастырады", isCorrect: false },
      { questionId: mq[12].id, answerText: "Циклді толығымен тоқтатады", isCorrect: true },
      { questionId: mq[12].id, answerText: "Келесі итерацияға өтеді", isCorrect: false },
      { questionId: mq[12].id, answerText: "Қате жібереді", isCorrect: false },

      { questionId: mq[13].id, answerText: "Шарт жалған болғанда", isCorrect: true },
      { questionId: mq[13].id, answerText: "Ешқашан тоқтамайды", isCorrect: false },
      { questionId: mq[13].id, answerText: "10 рет орындалған соң", isCorrect: false },
      { questionId: mq[13].id, answerText: "Қате кезінде", isCorrect: false },

      { questionId: mq[14].id, answerText: "Бір цикл ішінде басқа цикл", isCorrect: true },
      { questionId: mq[14].id, answerText: "Екі цикл қатар", isCorrect: false },
      { questionId: mq[14].id, answerText: "Шартсыз цикл", isCorrect: false },
      { questionId: mq[14].id, answerText: "Шексіз цикл", isCorrect: false },

      // Web security mid answers (mq15-mq19)
      { questionId: mq[15].id, answerText: "Внедрение HTML-кода", isCorrect: false },
      { questionId: mq[15].id, answerText: "Внедрение SQL-кода через пользовательский ввод", isCorrect: true },
      { questionId: mq[15].id, answerText: "Кража сессионных cookie", isCorrect: false },
      { questionId: mq[15].id, answerText: "DDoS-атака", isCorrect: false },

      { questionId: mq[16].id, answerText: "In-band", isCorrect: false },
      { questionId: mq[16].id, answerText: "Blind", isCorrect: true },
      { questionId: mq[16].id, answerText: "Out-of-band", isCorrect: false },
      { questionId: mq[16].id, answerText: "UNION", isCorrect: false },

      { questionId: mq[17].id, answerText: "Параметризованный SQL-запрос", isCorrect: true },
      { questionId: mq[17].id, answerText: "Функция шифрования", isCorrect: false },
      { questionId: mq[17].id, answerText: "Тип индекса в БД", isCorrect: false },
      { questionId: mq[17].id, answerText: "Метод валидации", isCorrect: false },

      { questionId: mq[18].id, answerText: "Prisma", isCorrect: false },
      { questionId: mq[18].id, answerText: "TypeORM", isCorrect: false },
      { questionId: mq[18].id, answerText: "Drizzle", isCorrect: true },
      { questionId: mq[18].id, answerText: "Sequelize", isCorrect: false },

      { questionId: mq[19].id, answerText: "Да, этого достаточно", isCorrect: false },
      { questionId: mq[19].id, answerText: "Нет, нужны параметризованные запросы", isCorrect: true },
      { questionId: mq[19].id, answerText: "Достаточно HTTPS", isCorrect: false },
      { questionId: mq[19].id, answerText: "Достаточно валидации на клиенте", isCorrect: false },
    ]);

    console.log("Added 8 quizzes with 60 questions and 240 answers");
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
