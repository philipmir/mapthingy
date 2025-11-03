"""
Test script to verify API configuration
Run this to test your setup before starting the full application
"""
import asyncio
import sys
from config import settings

async def test_setup():
    """Test the current configuration"""
    print("\n" + "="*60)
    print("🧪 TESTING MACHINE MONITOR SETUP")
    print("="*60)
    
    # Check current mode
    print(f"\n✅ Configuration loaded successfully")
    print(f"   Mode: {settings.use_mock_data.upper()}")
    
    if settings.is_mock_mode:
        print(f"\n🎮 MOCK MODE Configuration:")
        print(f"   ✓ Update Interval: {settings.simulation_update_interval}s")
        print(f"   ✓ Recovery Interval: {settings.simulation_recovery_interval}s")
        print(f"\n✅ Mock mode is ready to use!")
        print(f"   No API credentials needed for testing.")
        
    elif settings.is_real_mode:
        print(f"\n🔌 REAL API MODE Configuration:")
        print(f"   API URL: {settings.api_base_url}")
        print(f"   API Key: {'*' * 20 if settings.api_key != 'your_api_key_here' else 'NOT SET'}")
        print(f"   WebSocket: {settings.ws_url}")
        
        # Check if API credentials are configured
        if settings.api_key == "your_api_key_here":
            print(f"\n⚠️  WARNING: API key is not configured!")
            print(f"   Please set API_KEY in your .env file")
            print(f"   The system will fall back to mock mode.")
        else:
            print(f"\n📡 Testing API connection...")
            try:
                from api_client import create_api_client
                client = create_api_client()
                
                if client:
                    # Test connection
                    health = await client.health_check()
                    
                    if health.get("status") == "unhealthy":
                        print(f"   ❌ API connection failed: {health.get('error')}")
                        print(f"   Please verify your API_BASE_URL and API_KEY")
                    else:
                        print(f"   ✅ API connection successful!")
                        print(f"   Health: {health}")
                    
                    await client.close()
                else:
                    print(f"   ❌ Could not create API client")
                    print(f"   Check your API credentials in .env")
            except Exception as e:
                print(f"   ❌ Error testing API: {e}")
    
    # Check CORS configuration
    print(f"\n🌐 CORS Configuration:")
    for origin in settings.cors_origins_list:
        print(f"   ✓ {origin}")
    
    print(f"\n✅ Setup test complete!")
    print(f"\nTo start the application:")
    print(f"   python main.py")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        asyncio.run(test_setup())
    except KeyboardInterrupt:
        print("\n\n👋 Test cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error during setup test: {e}")
        print(f"\nPlease check your .env configuration")
        sys.exit(1)

