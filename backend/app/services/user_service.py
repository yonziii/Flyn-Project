import uuid
from supabase import create_client, Client
from app.core.config import settings

class UserService:
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

    def store_google_refresh_token(self, user_auth_id: uuid.UUID, refresh_token: str):
        """
        Stores the Google refresh token by calling a secure SQL function.
        """
        try:
            # The secret key is no longer passed from here.
            self.supabase.rpc('update_user_google_token', {
                'user_auth_id_input': str(user_auth_id),
                'token_input': refresh_token
            }).execute()
        except Exception as e:
            print(f"Error storing refresh token: {e}")