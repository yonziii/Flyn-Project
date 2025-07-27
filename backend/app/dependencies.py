# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from supabase import create_client, Client
from gotrue.errors import AuthApiError

from app.core.config import settings
from app.schemas import User

# Initialize Supabase client for backend operations
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Reusable bearer scheme
token_auth_scheme = HTTPBearer()

async def get_current_user(token: str = Depends(token_auth_scheme)) -> User:
    """
    Validates JWT and retrieves the user profile with the Google token decrypted.
    """

    print("\n--- AUTHENTICATION DEBUG ---")
    print(f"VERIFYING TOKEN... (ends with: ...{token.credentials[-6:]})")
    print(f"USING SECRET KEY... (ends with: ...{settings.SUPABASE_JWT_SECRET[-6:]})")

    try:
        auth_user = supabase.auth.get_user(jwt=token.credentials).user
        if not auth_user:
            raise HTTPException(status_code=401, detail="Token is invalid or expired.")
        
        response = supabase.rpc('get_decrypted_user_by_auth_id', {'user_auth_id_input': str(auth_user.id)}).single().execute()
        
        user_data = response.data
        if not user_data:
             raise HTTPException(status_code=404, detail="User profile not found in our database.")

        return User(**user_data)

    except AuthApiError as e:
        # THIS IS THE CRITICAL ERROR MESSAGE WE NEED TO SEE
        print(f"!!! AUTHENTICATION FAILED. Reason: {e.message} !!!")
        raise HTTPException(status_code=401, detail=f"Token validation failed: {e.message}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Could not validate credentials")