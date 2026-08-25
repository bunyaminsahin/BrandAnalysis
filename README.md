# BrandAnalysis

A full-stack feedback platform where users can share and explore company-related feedback.

The project was developed with a focus on modern JavaScript, REST API design, PostgreSQL integration, automated testing, code quality, and CI/CD automation.

## 🚀 Live 

[BrandAnalysis Live](https://brandanalysis.web.app/)

## 🛠️ Technologies

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API

### Backend

* Node.js
* Express.js
* REST API
* PostgreSQL
* `pg`
* CORS
* dotenv

### Testing & Code Quality

* Jest
* Supertest
* ESLint

### DevOps

* GitHub Actions
* Continuous Integration (CI)
* Continuous Deployment (CD)
* Firebase Hosting

## 🏗️ Architecture

```text
                    Frontend
              HTML + CSS + JavaScript
                         │
                         │ Fetch API
                         ▼
                  ┌─────────────┐
                  │  Express.js │
                  │    app.js   │
                  └──────┬──────┘
                         │
                      REST API
                         │
                         ▼
                  ┌─────────────┐
                  │ PostgreSQL  │
                  │    db.js    │
                  └─────────────┘
```

The backend separates application configuration from server startup:

```text
app.js
   │
   ├── Express application
   ├── Middleware
   └── API routes
          │
          ▼
       server.js
          │
          └── app.listen()
```

## 🔌 REST API

### Get Feedbacks

```http
GET /api/feedbacks
```

Returns all feedbacks ordered by creation date.

The endpoint also supports company filtering:

```http
GET /api/feedbacks?company=Garanti
```

### Create Feedback

```http
POST /api/feedbacks
```

Example request body:

```json
{
  "company": "Garanti",
  "badgeLetter": "G",
  "text": "Example feedback"
}
```

### Upvote Feedback

```http
PATCH /api/feedbacks/:id/upvote
```

Increases the selected feedback's upvote count.

## 🧪 Testing

The backend uses Jest and Supertest for automated API testing.

Current test coverage includes:

* GET feedbacks
* POST feedback
* PATCH upvote

Tests are located in:

```text
backend/tests/
├── feedbacks.get.test.js
├── feedbacks.post.test.js
└── feedbacks.upvote.test.js
```

## 🔍 Code Quality

ESLint is used to maintain consistent and reliable JavaScript code.

The backend provides a validation command:

```bash
npm run validate
```

This command runs:

```text
ESLint
   ↓
Jest
```

Both code quality checks and automated tests must pass successfully.

## 🔄 CI/CD Pipeline

The project uses GitHub Actions to automate validation and deployment.

### Continuous Integration

On every push to `main` and every pull request targeting `main`:

```text
GitHub
   ↓
GitHub Actions
   ↓
Checkout Repository
   ↓
Setup Node.js 20
   ↓
npm ci
   ↓
ESLint
   ↓
Jest
```

### Continuous Deployment

When changes are pushed to `main`:

```text
Push to main
      ↓
Backend Validation
      ↓
ESLint + Jest
      ↓
Validation successful?
      ↓
Firebase Hosting
      ↓
Production Deployment
```

Deployment depends on successful validation, preventing invalid code from being deployed.

## 🌿 Pull Request Preview

The project also uses Firebase Hosting with GitHub Actions to create preview deployments for pull requests.

This allows changes to be reviewed before merging them into the production branch.

## 🔐 Environment Variables

Sensitive configuration is stored in environment variables rather than committed to the repository.

Example:

```env
DATABASE_URL=your_database_connection_string
```

The actual environment configuration is excluded from Git using `.gitignore`.

## 📁 Project Structure

```text
BrandAnalysis/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── firebase-hosting-merge.yml
│       └── firebase-hosting-pull-request.yml
│
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── db.js
│   ├── eslint.config.js
│   ├── package.json
│   └── tests/
│       ├── feedbacks.get.test.js
│       ├── feedbacks.post.test.js
│       └── feedbacks.upvote.test.js
│
├── index.html
├── script.js
├── style.css
├── firebase.json
└── README.md
```

## 💡 What I Practiced

This project helped me apply and integrate:

* Modern JavaScript
* DOM manipulation
* Fetch API
* REST API development
* Express.js
* PostgreSQL
* Database queries
* API testing
* Jest & Supertest
* ESLint
* Git & GitHub
* GitHub Actions
* CI/CD
* Firebase Hosting
* Environment variable management

## 👨‍💻 Author

Bünyamin Şahin

Software Developer focused on building production-oriented web applications and expanding into backend development and DevOps practices.
