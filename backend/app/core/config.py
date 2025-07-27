from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """Loads and validates application settings from environment variables."""
    # Use model_config to specify the .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    FRONTEND_URL: str
    GSPREAD_CREDENTIALS_PATH: str
    GSPREAD_AUTHORIZED_USER_PATH: str
    GOOGLE_API_KEY: str

    LANGCHAIN_API_KEY: str
    LANGCHAIN_TRACING_V2: str
    
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    PGCRYPTO_SECRET_KEY: str
# Create a single, globally accessible instance of the settings
settings = Settings()