from pathlib import Path
from datetime import timedelta
import os
import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent

# ========================
# ✅ Security
# ========================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "1sqdq*qxk7gcfre+m-2rm!hx=t(g#ss)pfc4d)pkaf4l=a$eoj")
DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = [
    'api.whatyouwear.store',
    'whatyouwear.store',
    'www.whatyouwear.store',
    '13.127.0.77',
    'localhost',
    '127.0.0.1'
]



# ALLOWED_HOSTS = ['api.whatyouwear.store', '65.2.152.151', 'localhost', '127.0.0.1']


# ========================
# Proxy Configuration
# ========================
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ========================
# Django Apps
# ========================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Local apps
    "accounts",
    "product",
    "payment",
]

AUTH_USER_MODEL = "accounts.User"

# ========================
# Middleware
# ========================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS MUST BE HERE 👇
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "backend.urls"

# ========================
# Templates
# ========================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ========================
# Database
# ========================
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# ========================
# Password Validation
# ========================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ========================
# Internationalization
# ========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ========================
# Static & Media
# ========================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ========================
# REST Framework
# ========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # "rest_framework.permissions.AllowAny",
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

# ========================
# JWT Configuration
# ========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ========================
# CORS (Frontend Communication)
# ========================
CORS_ALLOWED_ORIGINS = [
    "https://www.whatyouwear.store",
    "https://whatyouwear.store",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True


CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# ========================
# CSRF (Form & Auth Safety)
# ========================
CSRF_TRUSTED_ORIGINS = [
    "https://api.whatyouwear.store",
    "https://www.api.whatyouwear.store",
    "https://www.whatyouwear.store",
    "https://whatyouwear.store",
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True


# ========================
# Sessions
# ========================
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_AGE = 86400 * 30
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# ========================
# Google OAuth
# ========================
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "323225275507-dnjb6ok6iv5u153c8nteu8ral51pnj13.apps.googleusercontent.com",
)

# ========================
# Logging
# ========================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}


# ========================
# Razorpay Configuration
# ========================
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RZDfGWLWfUuhot")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "nByz0vrFQwVDigMlCnDOpo8l")

# Log what's being used (helpful for debugging)
import logging
logger = logging.getLogger(__name__)
key_type = "TEST" if "test" in RAZORPAY_KEY_ID else "LIVE"
logger.info(f"🔐 Using Razorpay {key_type} keys: {RAZORPAY_KEY_ID[:15]}...")
# RAZORPAY_KEY_ID = "rzp_test_RZDfGWLWfUuhot"  
# RAZORPAY_KEY_SECRET = "nByz0vrFQwVDigMlCnDOpo8l"
