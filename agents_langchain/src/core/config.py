from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  GOOGLE_API_KEY: str

  model_config = SettingsConfigDict(
    env_file='.env',
    env_file_encoding='utf-8',
    extra='ignore'
  )

settings = Settings()

def get_settings():
  return settings