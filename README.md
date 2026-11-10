# projects

Public projects by MrBashy.

## [Password Generator](password-generator/)

A simple password generator that runs entirely in your browser. Nothing is sent anywhere.

- Choose length (4–64) and character types: uppercase, lowercase, numbers, symbols
- Option to avoid look-alike characters (I, l, 1, O, 0, o)
- Strength meter showing estimated entropy
- One-click copy
- Uses the browser's cryptographically secure random generator (`crypto.getRandomValues`), with no modulo bias

**Use it:** open `password-generator/index.html` in any browser.

**Run the tests** (needs Node.js):

```
cd password-generator
node --test
```
