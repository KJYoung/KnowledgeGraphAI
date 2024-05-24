# KnowledgeGraphAI
- npm version(`npm --version`): `10.8.0`
- yarn version(`yarn --version`): `1.22.22`
- nodeJS version(`node --version`): `v20.11.1`
- Python version(`python -V`): `Python 3.9.7`
  - Django version(`pip show django`): `Version: 4.1.3`
  - Djangorestframework(`pip show djangorestframework`): `Version: 3.14.0`
  - Django-cors-headers(`pip show django-cors-headers`): `Version: 3.13.0`
  - `python-dotenv`, `gradio`, `friendli-client`, `networkx`

## Operational Tips
- Backend DB 관리
  - `python manage.py createsuperuser`를 실행해서 admin user를 만든 후, 브라우저로 `http://127.0.0.1:8000/admin/`에 접속하여 그 user로 로그인하면 현재 Backend의 DB 구조를 볼 수 있습니다.

## Basic Tips
### How can you execute this repository?
- Frontend
```
    cd frontend
    yarn start
```
- Backend
- 일단, /backend 폴더에 .env 파일을 생성하고, `FRIENDLI_TOKEN = "{당신의 Friendli AI token}"`을 기입해주세요.
```
    cd backend
    python manage.py runserver
```
### How can you start coding?
- Install node, npm, yarn, python, django, ...
- Install libraries for yarn: `yarn install` at `/frontend`

### How did I create this repository?
- Create React App with TypeScript template: `yarn create react-app frontend --template typescript`
- Create Python App with Django framework:
    ```
        django-admin startproject backend
        cd backend
        django-admin startapp api
    ```