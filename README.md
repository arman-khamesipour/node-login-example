# About
Simple template repo which can be used to fork and create projects without needing much work before hand.

NOTE:
This has very little to no security, does encryption of passwords and auth tokens but can be brute forced as no login attempt limits etc...

# Systems
- node (express/passport)
- ejs (html templating)
- bootstrap 5
- dynamoDB

# Current Features
- https (local certs included)
- user login/registration
- app token generation
- jwt for api auth via app token

# Pre-reqs
Environment variables to run:
1. AWS_ACCESS_KEY_ID
2. AWS_SECRET_ACCESS_KEY
3. JWT_TOKEN_SECRET
4. NODE_PORT

AWS dynamodb instance

# TODO:
- [ ] add breadcrumb navigation
- [ ] convert to typescript