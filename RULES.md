# Development & Contribution Rules

To ensure code quality, project stability, and a smooth development workflow, all team members must adhere to the following rules. These are non-negotiable.

### 1. Branching Strategy: Git Flow Variant

All development must take place on feature branches. The `main` branch is considered stable and protected. Direct commits to `main` are strictly forbidden.

*   **Creating a Branch:** Create a new branch from the latest `main` branch for every new feature, bugfix, or task. Use a descriptive naming convention:
    *   `feature/admin-analytics-chart`
    *   `bugfix/login-form-validation`
    *   `chore/update-readme`

*   **Merging Code:** When a feature is complete, open a Pull Request (PR) against the `main` branch. The PR must include a clear description of the changes.
*   **Code Review:** Every PR requires **at least one approval** from another team member before it can bemerged. This is a critical step for quality assurance.

### 2. Security: Never Commit Secrets

API keys, service account credentials, and any other environment-specific variables are considered secrets and must **never** be committed to the Git repository.

*   **Use `.env` files:** All secrets must be stored in `.env` files locally.
*   **`.gitignore`:** The `.gitignore` file is configured to explicitly ignore `.env`, `.env.local`, and other potential secret-containing files. Do not modify these rules.
*   **Cloud Secret Management:** For production environments, secrets will be managed through the hosting provider's secret management service (e.g., Google Secret Manager), not via committed files.

### 3. Code Quality & Style: Enforce with Tooling

We enforce a consistent code style to maintain readability and reduce cognitive overhead. This is managed automatically.

*   **Tools:** We use **ESLint** for identifying problematic patterns in code and **Prettier** for automated code formatting.
*   **Pre-Commit Hook:** A pre-commit hook is configured in `package.json`. Before any commit is finalized, this hook will automatically run Prettier and ESLint on the staged files.
*   **CI/CD Pipeline:** The continuous integration pipeline will also run these checks. A PR cannot be merged if the linting or formatting checks fail.

### 4. Firebase Security Rules: Deny by Default

Our Firestore database is governed by a "deny by default" security principle. No user can read or write any data unless explicitly allowed.

*   **Explicit Permissions:** Every collection must have a `match` block in `firestore.rules` that defines who can `read` and `write` data and under what conditions.
*   **No Wildcards in Production:** Wildcard rules like `allow read, write: if true;` are strictly forbidden for any production deployment. They may be used for temporary, local-only prototyping but must be replaced with secure, authenticated rules before opening a PR.
*   **Test Your Rules:** Use the Firebase Emulator Suite or the Rules Playground in the Firebase Console to test your security rules before deploying them.
