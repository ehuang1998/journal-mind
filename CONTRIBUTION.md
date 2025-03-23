# 🧠 Git Collaboration Guide — *journal-mind* Project

## ✅ Prerequisites
Make sure each team member:
- Has a [GitHub account](https://github.com/)
- Has been added as a **collaborator** to the repo
- Has [Git](https://git-scm.com/downloads) installed
- Has Node.js, npm, and VS Code (recommended)

---

## 1️⃣ Clone the Repo (One-time Setup)

```bash
git clone https://github.com/ehuang1998/journal-mind.git
cd journal-mind
```

---

## 2️⃣ Set Up Your Environment

Install all dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

---

## 3️⃣ Always Pull Latest Code Before You Start

To avoid merge conflicts:

```bash
git checkout main
git pull origin main
```

---

## 4️⃣ Create a Feature Branch

Never work directly on `main`.

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/mood-tracker-ui
```

---

## 5️⃣ Make Your Changes

- Code your feature
- Test locally (`npm run dev`)
- Make sure everything looks and works right

---

## 6️⃣ Stage & Commit

```bash
git add .
git commit -m "Add: implemented mood tracker UI"
```

Commit message format (recommended):
- `Add:` new feature
- `Fix:` bug fix
- `Update:` content update
- `Refactor:` code reorganization

---

## 7️⃣ Push Your Branch

```bash
git push origin feature/your-feature-name
```

---

## 8️⃣ Create a Pull Request (PR)

1. Go to GitHub → `journal-mind` repo
2. Click “Compare & pull request”
3. Add a clear title and description
4. Submit for review

Someone from the team (or yourself if allowed) will merge it after review.

---

## 🔁 Optional Git Commands Cheat Sheet

| Action | Command |
|--------|---------|
| See current branch | `git branch` |
| Switch branch | `git checkout branch-name` |
| Delete branch (local) | `git branch -d branch-name` |
| View status | `git status` |
| See commit history | `git log --oneline --graph` |

---

## 🚀 Summary Workflow

1. `git pull origin main`
2. `git checkout -b feature/my-feature`
3. Make changes
4. `git add .`
5. `git commit -m "message"`
6. `git push origin feature/my-feature`
7. Open a PR

---

## 🔒 Note on Protected Branch

The `main` branch is **protected**. You cannot push directly — all changes must go through a PR.

This ensures:
- Code reviews
- No broken main branch
- Easier rollbacks if needed
