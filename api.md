# Документация по API

## Базовый URL

/api

Служебный endpoint `GET /health` находится вне базового префикса (`/api`).

---

# Аутентификация

## POST /auth/register

Регистрация нового пользователя.

**Rate limit:** максимум 10 запросов в 15 минут на IP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "JohnDoe",
  "avatarUrl": "https://..."
}
```

**Примечание:** для POST-запросов требуется Turnstile токен в заголовке `x-turnstile-token` или в теле как `turnstileToken`.

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "JohnDoe",
    "role": "USER"
  }
}
```

**Response (лимит превышен):**
```json
{
  "error": "Too many registration attempts, please try again later"
}
```

## POST /auth/login

Авторизация, получение JWT.

**Rate limit:** максимум 5 запросов в 15 минут на IP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Примечание:** для POST-запросов требуется Turnstile токен в заголовке `x-turnstile-token` или в теле как `turnstileToken`.

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "JohnDoe",
    "role": "USER"
  }
}
```

**Response (лимит превышен):**
```json
{
  "error": "Too many login attempts, please try again later"
}
```

## POST /auth/forgot-password

Запросить ссылку для сброса пароля.

**Rate limit:** максимум 5 запросов в 15 минут на IP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Примечание:** для POST-запросов требуется Turnstile токен в заголовке `x-turnstile-token` или в теле как `turnstileToken`.

**Response (всегда одинаковый):**
```json
{
  "message": "If an account with that email exists, reset instructions were sent"
}
```

**Response (лимит превышен):**
```json
{
  "error": "Too many reset attempts, please try again later"
}
```

## POST /auth/reset-password

Сбросить пароль по токену из письма.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_secure_password"
}
```

**Примечание:** для POST-запросов требуется Turnstile токен в заголовке `x-turnstile-token` или в теле как `turnstileToken`.

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

**Response (невалидный или истекший токен):**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

# Публичные маршруты

## Служебные маршруты

### GET /health

Liveness check для оркестрации/мониторинга.

**Аутентификация:** требуется.

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-04-25T10:20:30.000Z"
}
```

### GET /site-visits

Получить общее количество посещений сайта.

**Аутентификация:** не требуется.

**Response:**
```json
{
  "count": 1234,
  "updatedAt": "2026-05-12T09:15:00.000Z"
}
```

### POST /site-visits/increment

Увеличить счетчик посещений сайта на 1.

**Аутентификация:** не требуется.

**Response:**
```json
{
  "count": 1235,
  "updatedAt": "2026-05-12T09:16:00.000Z"
}
```

---

## DeepSeek

Маршруты: `/deepseek`. Требуется аутентификация.

### POST /deepseek/chat

Отправить сообщение в DeepSeek. Допускаются только темы по сетям, программированию и связанным направлениям.

**Request Body:**
```json
{
  "message": "Explain TCP vs UDP."
}
```

**Response:**
```json
{
  "message": "TCP обеспечивает надежную доставку..."
}
```

**Response (off-topic):**
```json
{
  "error": "off_topic",
  "message": "I can only discuss networking, programming, and related software topics. Please ask about those subjects."
}
```

**Примечание:** Используется модель `deepseek-chat-flash`.

## Пользователи (Users)

Маршруты определены в `/users`. Требуется аутентификация.

### GET /users/:id

Получить пользователя по ID.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "JohnDoe",
  "avatarUrl": "https://...",
  "bio": null,
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "enrollments": [],
  "progresses": []
}
```

### PUT /users/:id

Обновить данные пользователя.

**Request Body:**
```json
{
  "username": "NewUsername",
  "avatarUrl": "https://..."
}
```

### DELETE /users/:id

Удалить пользователя.

---

## Публичные профили (Profiles)

Маршруты определены в `/profiles`. Аутентификация не требуется.

### GET /profiles/:id

Получить публичный профиль пользователя по ID.

**Response:**
```json
{
  "id": 1,
  "username": "JohnDoe",
  "avatarUrl": "https://...",
  "bio": "Frontend dev",
  "socialLinks": [
    {
      "id": 1,
      "platform": "github",
      "url": "https://github.com/johndoe"
    }
  ],
  "certifications": [
    {
      "id": 10,
      "issuedAt": "2026-02-15T10:30:00.000Z",
      "course": {
        "id": 1,
        "title": "JavaScript для начинающих",
        "category": "Programming"
      }
    }
  ],
  "stats": {
    "postsCount": 8,
    "repliesCount": 34
  }
}
```

### GET /profiles/u/:username

Получить публичный профиль по username.

**Примечание:** `username` уникален.

---

## Курсы (Courses)

Маршруты определены в `/courses`.

### GET /courses

Получить все курсы.

**Response:**
```json
[
  {
    "id": 1,
    "title": "JS Basics",
    "description": "intro",
    "category": "programming",
    "price": 20000,
    "requireQuizCompletion": false,
    "minQuizScore": 65,
    "averageRating": 4.5,
    "ratingsCount": 12,
    "enrollments": [],
    "sections": []
  }
]
```

### GET /courses/:courseId

Получить курс по ID.

**Response:**
```json
{
  "id": 1,
  "title": "JS Basics",
  "description": "intro",
  "category": "programming",
  "price": null,
  "requireQuizCompletion": false,
  "minQuizScore": 65,
  "averageRating": 4.5,
  "ratingsCount": 12,
  "enrollments": [],
  "sections": []
}
```

---

## Записи на курсы (Enrollments)

Интегрированы в `/courses/:courseId/enrollments`.

### GET /courses/:courseId/enrollments

Получить всех записанных пользователей на курс.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "enrolledAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "JohnDoe",
      "avatarUrl": "https://...",
      "bio": null
    }
  }
]
```

**Примечание:** Для обычных пользователей возвращаются только их собственные записи. Для администраторов - все записи на курс.

### POST /courses/:courseId/enrollments

Создать запись на курс.

**Request Body:**
```json
{
  "userId": 1
}
```

### DELETE /courses/:courseId/enrollments/:enrollmentId

Удалить запись с курса.

---

## Разделы (Sections)

Маршруты: `/courses/:courseId/sections`.

### GET /courses/:courseId/sections

Получить все разделы курса.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Введение",
    "orderIndex": 0,
    "courseId": 1
  }
]
```

### GET /courses/:courseId/sections/:sectionId

Получить раздел по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Введение",
  "orderIndex": 0,
  "courseId": 1,
  "lessons": [],
  "course": {
    "id": 1,
    "title": "JS Basics",
    "description": "intro",
    "category": "programming"
  }
}
```

---

## Уроки (Lessons)

Маршруты: `/courses/:courseId/sections/:sectionId/lessons`.

### GET /courses/:courseId/sections/:sectionId/lessons

Получить все уроки раздела.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Что такое JS",
    "contentType": "text",
    "videoUrl": null,
    "textContent": "# Markdown lesson",
    "orderIndex": 0,
    "sectionId": 1,
    "section": {
      "id": 1,
      "title": "Введение",
      "courseId": 1
    },
    "quizzes": []
  }
]
```

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId

Получить урок по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Что такое JS",
  "contentType": "text",
  "videoUrl": null,
  "textContent": "# Markdown lesson",
  "orderIndex": 0,
  "sectionId": 1,
  "section": {
    "id": 1,
    "title": "Введение",
    "courseId": 1
  },
  "quizzes": []
}
```

---

## Прогресс (Progress)

Маршруты: `/courses/:courseId/progress`.

### GET /courses/:courseId/progress

Получить прогресс пользователя по курсу.

**Response (если прогресс существует):**
```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "status": "in_progress",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (если прогресс не найден):**
```json
{
  "status": "not_started"
}
```

### PUT /courses/:courseId/progress

Создать или обновить прогресс.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Допустимые значения status:**
- `"not_started"`
- `"in_progress"`
- `"completed"`

**Примечание:** При установке статуса `"completed"`:
- Если для курса включено `requireQuizCompletion`, курс нельзя завершить пока не пройдены все викторины с минимальным баллом `minQuizScore`.
- Автоматически создается сертификат с уникальным кодом
- Автоматически присваивается значок (badge), если он привязан к этому курсу

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "status": "completed",
  "updatedAt": "2026-02-18T12:00:00.000Z"
}
```

**Response (не пройдены все викторины):**
```json
{
  "error": "Complete all quizzes before finishing the course",
  "missingQuizIds": [1, 3],
  "minScore": 65
}
```

---

## Оценки курсов (Course Ratings)

Маршруты: `/courses/:courseId/ratings`.

### GET /courses/:courseId/ratings

Получить среднюю оценку и количество оценок для курса.

**Response:**
```json
{
  "average": 4.5,
  "count": 12
}
```

### GET /courses/:courseId/ratings/me

Получить оценку текущего пользователя для курса.

**Аутентификация:** требуется.

**Response:**
```json
{
  "rating": 4
}
```

**Response (оценки нет):**
```json
{
  "rating": null
}
```

### POST /courses/:courseId/ratings

Поставить или обновить оценку курса.

**Аутентификация:** требуется.

**Доступ:** только для пользователей, записанных на курс.

**Request Body:**
```json
{
  "rating": 5
}
```

**Response:**
```json
{
  "rating": 5,
  "average": 4.6,
  "count": 13
}
```

**Response (нет доступа):**
```json
{
  "error": "Only enrolled users can rate this course"
}
```

---

## Викторины (Quizzes)

Маршруты: `/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes`.

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes

Получить все викторины урока.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Основы JS",
    "lessonId": 1,
    "lesson": {
      "id": 1,
      "title": "Что такое JS",
      "sectionId": 1
    },
    "questions": []
  }
]
```

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId

Получить викторину по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Основы JS",
  "lessonId": 1,
  "lesson": {
    "id": 1,
    "title": "Что такое JS",
    "sectionId": 1
  },
  "questions": [
    {
      "id": 1,
      "questionText": "Что такое переменная?",
      "questionType": "single",
      "quizId": 1,
      "answers": []
    }
  ]
}
```

### POST /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/attempts

Отправить попытку прохождения викторины.

**Аутентификация:** требуется.

**Примечания:**
- Учитываются только вопросы типов `single` и `multiple`.
- Вопросы типа `text` не влияют на оценку.
- Проходной балл берется из настроек курса (`minQuizScore`, по умолчанию 65).

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "answerIds": [3]
    },
    {
      "questionId": 2,
      "answerIds": [5, 6]
    }
  ]
}
```

**Response:**
```json
{
  "attemptId": 10,
  "score": 75,
  "passed": true,
  "correctCount": 3,
  "totalCount": 4,
  "minScore": 65
}
```

---

## Вопросы (Questions)

Маршруты:
`/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions`

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions

Получить все вопросы викторины.

**Response:**
```json
[
  {
    "id": 1,
    "questionText": "Что такое переменная?",
    "questionType": "single",
    "quizId": 1,
    "answers": []
  }
]
```

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId

Получить вопрос по ID.

**Response:**
```json
{
  "id": 1,
  "questionText": "Что такое переменная?",
  "questionType": "single",
  "quizId": 1,
  "answers": [],
  "quiz": {
    "id": 1,
    "title": "Основы JS",
    "lessonId": 1
  }
}
```

---

## Ответы (Answers)

Маршрут:
`/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers`

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers

Получить все ответы на вопрос.

**Response:**
```json
[
  {
    "id": 1,
    "answerText": "Контейнер для данных",
    "isCorrect": true,
    "questionId": 1,
    "question": {
      "id": 1,
      "questionText": "Что такое переменная?",
      "questionType": "single",
      "quizId": 1
    }
  }
]
```

### GET /courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers/:answerId

Получить ответ по ID.

**Response:**
```json
{
  "id": 1,
  "answerText": "Контейнер для данных",
  "isCorrect": true,
  "questionId": 1,
  "question": {
    "id": 1,
    "questionText": "Что такое переменная?",
    "questionType": "single",
    "quizId": 1
  }
}
```

---

## Значки (Badges)

Маршруты: `/badges`.

### GET /badges

Получить список всех значков.


**Response:**
```json
[
  {
    "id": 1,
    "name": "JavaScript Master",
    "description": "Завершил курс по JavaScript",
    "imageUrl": "https://example.com/badge.png",
    "courseId": 1,
    "course": {
      "id": 1,
      "title": "JavaScript для начинающих",
      "description": "Основы JavaScript",
      "category": "Programming"
    },
    "userBadges": []
  }
]
```

### GET /badges/me

Получить все значки текущего пользователя.


**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "badgeId": 1,
    "awardedAt": "2026-02-15T10:30:00.000Z",
    "badge": {
      "id": 1,
      "name": "JavaScript Master",
      "description": "Завершил курс по JavaScript",
      "imageUrl": "https://example.com/badge.png",
      "courseId": 1
    }
  }
]
```

---

## Сертификаты (Certifications)

Маршруты: `/certifications`.

### GET /certifications/me

Получить все сертификаты текущего пользователя.


**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "certificateCode": "a1b2c3d4e5f6",
    "issuedAt": "2026-02-15T10:30:00.000Z",
    "course": {
      "id": 1,
      "title": "JavaScript для начинающих",
      "description": "Основы JavaScript",
      "category": "Programming"
    }
  }
]
```

### GET /certifications/verify/:code

Проверить подлинность сертификата по коду.


**Параметры:**
- `code` (string) - Код сертификата

**Response (успешная проверка):**
```json
{
  "valid": true,
  "certificateCode": "a1b2c3d4e5f6",
  "issuedAt": "2026-02-15T10:30:00.000Z",
  "user": {
    "username": "JohnDoe",
    "avatarUrl": "https://example.com/avatar.png"
  },
  "course": {
    "title": "JavaScript для начинающих",
    "category": "Programming"
  }
}
```

**Response (сертификат не найден):**
```json
{
  "error": "Certificate not found"
}
```

### GET /certifications/:code/pdf

Скачать PDF сертификата по коду.

**Аутентификация:** требуется.

**Доступ:** только владелец сертификата или ADMIN.

**Параметры:**
- `code` (string) - Код сертификата

**Response:**
- `200` с `Content-Type: application/pdf`
- `Content-Disposition: inline; filename="certificate-<code>.pdf"`

**Response (сертификат не найден):**
```json
{
  "error": "Certificate not found"
}
```

**Response (нет доступа):**
```json
{
  "error": "Forbidden"
}
```

---

## Ссылки на соц. сети (Social Links)

Маршруты: `/social-links`.


### GET /social-links

Получить все ссылки на соц. сети текущего пользователя.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "platform": "github",
    "url": "https://github.com/username"
  },
  {
    "id": 2,
    "userId": 1,
    "platform": "twitter",
    "url": "https://twitter.com/username"
  }
]
```

### POST /social-links

Создать новую ссылку.

**Request Body:**
```json
{
  "platform": "github",
  "url": "https://github.com/username"
}
```

**Поля:**
- `platform` (enum) - Платформа: `"github"`, `"twitter"`, `"youtube"`, `"website"`, `"other"`
- `url` (string) - URL адрес (должен быть валидным URL)

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "platform": "github",
  "url": "https://github.com/username"
}
```

### PUT /social-links/:id

Обновить ссылку.

**Request Body:**
```json
{
  "platform": "twitter",
  "url": "https://twitter.com/newusername"
}
```

**Поля (все опциональны):**
- `platform` (enum) - Платформа: `"github"`, `"twitter"`, `"youtube"`, `"website"`, `"other"`
- `url` (string) - URL адрес

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "platform": "twitter",
  "url": "https://twitter.com/newusername"
}
```

### DELETE /social-links/:id

Удалить ссылку.

**Response:** 204 No Content

---

## Форум (Forum)

Маршруты: `/forum`.

### GET /forum/posts

Получить список постов форума.

**Query Params (optional):**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "First post",
      "body": "Hello forum!",
      "createdAt": "2026-03-23T19:57:31.072Z",
      "updatedAt": "2026-03-23T19:57:31.072Z",
      "user": {
        "id": 1,
        "username": "JohnDoe",
        "avatarUrl": "https://...",
        "bio": null
      },
      "replies": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET /forum/posts/:postId

Получить пост форума по ID.

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "title": "First post",
  "body": "Hello forum!",
  "createdAt": "2026-03-23T19:57:31.072Z",
  "updatedAt": "2026-03-23T19:57:31.072Z",
  "user": {
    "id": 1,
    "username": "JohnDoe",
    "avatarUrl": "https://...",
    "bio": null
  },
  "replies": []
}
```

### POST /forum/posts

Создать новый пост (требуется аутентификация).

**Request Body:**
```json
{
  "title": "First post",
  "body": "Hello forum!"
}
```

### PUT /forum/posts/:postId

Обновить пост (требуется аутентификация, автор или ADMIN).

**Request Body:**
```json
{
  "title": "Updated title",
  "body": "Updated body"
}
```

### DELETE /forum/posts/:postId

Удалить пост (требуется аутентификация, автор или ADMIN).

### GET /forum/posts/:postId/replies

Получить ответы на пост.

**Query Params (optional):**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "postId": 1,
      "userId": 2,
      "body": "Nice post!",
      "createdAt": "2026-03-23T20:00:00.000Z",
      "updatedAt": "2026-03-23T20:00:00.000Z",
      "user": {
        "id": 2,
        "username": "JaneDoe",
        "avatarUrl": "https://...",
        "bio": null
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /forum/posts/:postId/replies

Создать ответ на пост (требуется аутентификация).

**Request Body:**
```json
{
  "body": "Nice post!"
}
```

### PUT /forum/posts/:postId/replies/:replyId

Обновить ответ (требуется аутентификация, автор или ADMIN).

**Request Body:**
```json
{
  "body": "Updated reply"
}
```

### DELETE /forum/posts/:postId/replies/:replyId

Удалить ответ (требуется аутентификация, автор или ADMIN).

---

# Админские маршруты

Все админские маршруты требуют аутентификацию и роль `ADMIN`.

## Пользователи (Users)

Маршруты определены в `/admin/users`.

### GET /admin/users

Получить список всех пользователей.

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "JohnDoe",
    "avatarUrl": "https://...",
    "bio": null,
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "enrollments": [],
    "progresses": []
  }
]
```

### GET /admin/users/:id

Получить пользователя по ID.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "JohnDoe",
  "avatarUrl": "https://...",
  "bio": null,
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "enrollments": [],
  "progresses": []
}
```

### POST /admin/users

Создать нового пользователя.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "123456",
  "username": "NewUser",
  "avatarUrl": "https://...",
  "role": "USER"
}
```

### PUT /admin/users/:id

Обновить пользователя.

**Request Body:**
```json
{
  "username": "UpdatedUsername",
  "role": "ADMIN"
}
```

### DELETE /admin/users/:id

Удалить пользователя.

---

## Форум (Forum)

Маршруты: `/admin/forum`.

### POST /admin/forum/posts

Создать новый пост (только ADMIN).

**Request Body:**
```json
{
  "title": "First post",
  "body": "Hello forum!"
}
```

### PUT /admin/forum/posts/:postId

Обновить пост (только ADMIN).

**Request Body:**
```json
{
  "title": "Updated title",
  "body": "Updated body"
}
```

### DELETE /admin/forum/posts/:postId

Удалить пост (только ADMIN).

### POST /admin/forum/posts/:postId/replies

Создать ответ на пост (только ADMIN).

**Request Body:**
```json
{
  "body": "Nice post!"
}
```

### PUT /admin/forum/posts/:postId/replies/:replyId

Обновить ответ (только ADMIN).

**Request Body:**
```json
{
  "body": "Updated reply"
}
```

### DELETE /admin/forum/posts/:postId/replies/:replyId

Удалить ответ (только ADMIN).

---

## Курсы (Courses)

Маршруты определены в `/admin/courses`.

### GET /admin/courses

Получить все курсы.

**Response:**
```json
[
  {
    "id": 1,
    "title": "JS Basics",
    "description": "intro",
    "category": "programming",
    "price": 20000,
    "requireQuizCompletion": false,
    "minQuizScore": 65,
    "enrollments": [],
    "sections": []
  }
]
```

### GET /admin/courses/:courseId

Получить курс по ID.

**Response:**
```json
{
  "id": 1,
  "title": "JS Basics",
  "description": "intro",
  "category": "programming",
  "price": null,
  "requireQuizCompletion": false,
  "minQuizScore": 65,
  "enrollments": [],
  "sections": []
}
```

### POST /admin/courses

Создать новый курс.

**Request Body:**
```json
{
  "title": "JS Basics",
  "description": "intro",
  "category": "programming",
  "price": 20000,
  "requireQuizCompletion": true,
  "minQuizScore": 65
}
```

### PUT /admin/courses/:courseId

Обновить курс.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "web-development",
  "price": null,
  "requireQuizCompletion": true,
  "minQuizScore": 70
}
```

### DELETE /admin/courses/:courseId

Удалить курс.

---

## Разделы (Sections)

Маршруты: `/admin/courses/:courseId/sections`.

### GET /admin/courses/:courseId/sections

Получить все разделы курса.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Введение",
    "orderIndex": 0,
    "courseId": 1,
    "lessons": []
  }
]
```

### GET /admin/courses/:courseId/sections/:sectionId

Получить раздел по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Введение",
  "orderIndex": 0,
  "courseId": 1,
  "lessons": [],
  "course": {
    "id": 1,
    "title": "JS Basics",
    "description": "intro",
    "category": "programming"
  }
}
```

### POST /admin/courses/:courseId/sections

Создать новый раздел.

**Request Body:**
```json
{
  "title": "Введение",
  "orderIndex": 0
}
```

### PUT /admin/courses/:courseId/sections/:sectionId

Обновить раздел.

**Request Body:**
```json
{
  "title": "Обновленное название",
  "orderIndex": 1
}
```

### DELETE /admin/courses/:courseId/sections/:sectionId

Удалить раздел.

---

## Уроки (Lessons)

Маршруты: `/admin/courses/:courseId/sections/:sectionId/lessons`.

### GET /admin/courses/:courseId/sections/:sectionId/lessons

Получить все уроки раздела.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Что такое JS",
    "contentType": "text",
    "videoUrl": null,
    "textContent": "# Markdown lesson",
    "orderIndex": 0,
    "sectionId": 1,
    "section": {
      "id": 1,
      "title": "Введение",
      "courseId": 1
    },
    "quizzes": []
  }
]
```

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId

Получить урок по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Что такое JS",
  "contentType": "text",
  "videoUrl": null,
  "textContent": "# Markdown lesson",
  "orderIndex": 0,
  "sectionId": 1,
  "section": {
    "id": 1,
    "title": "Введение",
    "courseId": 1
  },
  "quizzes": []
}
```

### POST /admin/courses/:courseId/sections/:sectionId/lessons

Создать новый урок.

**Request Body:**
```json
{
  "title": "Что такое JS",
  "contentType": "text",
  "videoUrl": null,
  "textContent": "# Markdown lesson",
  "orderIndex": 0
}
```

**Допустимые значения contentType:**
- `"text"` - текстовый урок (Markdown)
- `"video"` - видео урок
- `"quiz"` - урок-викторина

### PUT /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId

Обновить урок.

**Request Body:**
```json
{
  "title": "Обновленное название",
  "textContent": "# Обновленный контент"
}
```

### DELETE /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId

Удалить урок.

---

## Прогресс (Progress)

Маршруты: `/admin/courses/:courseId/progress`.

### GET /admin/courses/:courseId/progress

Получить прогресс всех пользователей по курсу (только для администраторов).

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "status": "in_progress",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": 1,
      "username": "JohnDoe",
      "avatarUrl": "https://...",
      "bio": null
    }
  }
]
```

### GET /admin/courses/:courseId/progress/:userId

Получить прогресс конкретного пользователя по курсу (только для администраторов).

**Response (если прогресс существует):**
```json
{
  "id": 1,
  "userId": 1,
  "courseId": 1,
  "status": "in_progress",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (если прогресс не найден):**
```json
{
  "status": "not_started"
}
```

### PUT /admin/courses/:courseId/progress/:userId

Создать или обновить прогресс пользователя (только для администраторов).

**Request Body:**
```json
{
  "status": "completed"
}
```

**Допустимые значения status:**
- `"not_started"`
- `"in_progress"`
- `"completed"`

**Примечание:** При установке статуса `"completed"`:
- Автоматически создается сертификат с уникальным кодом
- Автоматически присваивается значок (badge), если он привязан к этому курсу

---

## Викторины (Quizzes)

Маршруты: `/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes`.

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes

Получить все викторины урока.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Основы JS",
    "lessonId": 1,
    "lesson": {
      "id": 1,
      "title": "Что такое JS",
      "sectionId": 1
    },
    "questions": []
  }
]
```

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId

Получить викторину по ID.

**Response:**
```json
{
  "id": 1,
  "title": "Основы JS",
  "lessonId": 1,
  "lesson": {
    "id": 1,
    "title": "Что такое JS",
    "sectionId": 1
  },
  "questions": [
    {
      "id": 1,
      "questionText": "Что такое переменная?",
      "questionType": "single",
      "quizId": 1,
      "answers": []
    }
  ]
}
```

### POST /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes

Создать новую викторину.

**Request Body:**
```json
{
  "title": "Основы JS"
}
```

### PUT /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId

Обновить викторину.

**Request Body:**
```json
{
  "title": "Обновленное название викторины"
}
```

### DELETE /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId

Удалить викторину.

---

## Вопросы (Questions)

Маршруты:
`/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions`

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions

Получить все вопросы викторины.

**Response:**
```json
[
  {
    "id": 1,
    "questionText": "Что такое переменная?",
    "questionType": "single",
    "quizId": 1,
    "answers": []
  }
]
```

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId

Получить вопрос по ID.

**Response:**
```json
{
  "id": 1,
  "questionText": "Что такое переменная?",
  "questionType": "single",
  "quizId": 1,
  "answers": [],
  "quiz": {
    "id": 1,
    "title": "Основы JS",
    "lessonId": 1
  }
}
```

### POST /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions

Создать новый вопрос.

**Request Body:**
```json
{
  "questionText": "Что такое переменная?",
  "questionType": "single"
}
```

**Допустимые значения questionType:**
- `"single"` - один правильный ответ
- `"multiple"` - несколько правильных ответов
- `"text"` - текстовый ответ

### PUT /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId

Обновить вопрос.

**Request Body:**
```json
{
  "questionText": "Обновленный текст вопроса?",
  "questionType": "multiple"
}
```

### DELETE /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId

Удалить вопрос.

---

## Ответы (Answers)

Маршрут:
`/admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers`

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers

Получить все ответы на вопрос.

**Response:**
```json
[
  {
    "id": 1,
    "answerText": "Контейнер для данных",
    "isCorrect": true,
    "questionId": 1,
    "question": {
      "id": 1,
      "questionText": "Что такое переменная?",
      "questionType": "single",
      "quizId": 1
    }
  }
]
```

### GET /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers/:answerId

Получить ответ по ID.

**Response:**
```json
{
  "id": 1,
  "answerText": "Контейнер для данных",
  "isCorrect": true,
  "questionId": 1,
  "question": {
    "id": 1,
    "questionText": "Что такое переменная?",
    "questionType": "single",
    "quizId": 1
  }
}
```

### POST /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers

Создать новый ответ.

**Request Body:**
```json
{
  "answerText": "Контейнер для данных",
  "isCorrect": true
}
```

### PUT /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers/:answerId

Обновить ответ.

**Request Body:**
```json
{
  "answerText": "Обновленный текст ответа",
  "isCorrect": false
}
```

### DELETE /admin/courses/:courseId/sections/:sectionId/lessons/:lessonId/quizzes/:quizId/questions/:questionId/answers/:answerId

Удалить ответ.

---

## Значки (Badges)

Маршруты: `/admin/badges`.

### GET /admin/badges

Получить список всех значков.

**Response:**
```json
[
  {
    "id": 1,
    "name": "JavaScript Master",
    "description": "Завершил курс по JavaScript",
    "imageUrl": "https://example.com/badge.png",
    "courseId": 1,
    "course": {
      "id": 1,
      "title": "JavaScript для начинающих",
      "description": "Основы JavaScript",
      "category": "Programming"
    }
  }
]
```

### POST /admin/badges

Создать новый значок.

**Request Body:**
```json
{
  "name": "JavaScript Master",
  "description": "Завершил курс по JavaScript",
  "imageUrl": "https://example.com/badge.png",
  "courseId": 1
}
```

**Поля:**
- `name` (string, обязательное) - Название значка
- `description` (string, опциональное) - Описание значка
- `imageUrl` (string URL, опциональное) - URL изображения значка
- `courseId` (number, опциональное) - ID курса, с которым связан значок

**Response:**
```json
{
  "id": 1,
  "name": "JavaScript Master",
  "description": "Завершил курс по JavaScript",
  "imageUrl": "https://example.com/badge.png",
  "courseId": 1
}
```

### PUT /admin/badges/:id

Обновить значок.

**Request Body (все поля опциональны):**
```json
{
  "name": "Advanced JavaScript Master",
  "description": "Завершил продвинутый курс по JavaScript",
  "imageUrl": "https://example.com/new-badge.png",
  "courseId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Advanced JavaScript Master",
  "description": "Завершил продвинутый курс по JavaScript",
  "imageUrl": "https://example.com/new-badge.png",
  "courseId": 2
}
```

### DELETE /admin/badges/:id

Удалить значок.

**Response:** 204 No Content

### GET /admin/badges/users/:userId

Получить все значки конкретного пользователя.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "badgeId": 1,
    "awardedAt": "2026-02-15T10:30:00.000Z",
    "badge": {
      "id": 1,
      "name": "JavaScript Master",
      "description": "Завершил курс по JavaScript",
      "imageUrl": "https://example.com/badge.png",
      "courseId": 1
    }
  }
]
```

---

## Сертификаты (Certifications)

Маршруты: `/admin/certifications`.

### GET /admin/certifications/users/:userId

Получить все сертификаты конкретного пользователя.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "courseId": 1,
    "certificateCode": "a1b2c3d4e5f6",
    "issuedAt": "2026-02-15T10:30:00.000Z",
    "course": {
      "id": 1,
      "title": "JavaScript для начинающих",
      "description": "Основы JavaScript",
      "category": "Programming"
    }
  }
]
```

**Примечание:** Сертификаты создаются автоматически при завершении курса (установке статуса прогресса в `"completed"`).

---

## Общие замечания

### Аутентификация

Для доступа к защищенным маршрутам необходимо передавать JWT токен в заголовке:

```
Authorization: Bearer <your_jwt_token>
```

### Коды ответов

- `200` - успешный запрос
- `201` - ресурс создан
- `204` - успешное удаление (без тела ответа)
- `400` - ошибка валидации
- `401` - не авторизован
- `403` - доступ запрещен
- `404` - ресурс не найден
- `500` - внутренняя ошибка сервера

### Формат ошибок

```json
{
  "error": "Описание ошибки"
}
```
