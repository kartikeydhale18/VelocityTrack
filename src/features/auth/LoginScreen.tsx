import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Target } from 'lucide-react';

export default function LoginScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to login with Google. Make sure you enabled Google Auth in the Firebase Console!");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl mix-blend-screen"></div>

      <Card className="max-w-md w-full bg-slate-900/60 border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500 z-10">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-600/20 transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <Target size={40} className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl font-bold text-slate-100 mb-3 tracking-tight">VelocityTrack</h1>
          <p className="text-slate-400 mb-10 text-lg">Secure Performance Governance</p>
          
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoggingIn}
            className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-semibold gap-3 text-lg shadow-xl shadow-white/5 transition-all hover:scale-105 active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            {isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}
          </Button>

          <p className="text-slate-600 text-xs mt-8 font-medium max-w-[250px] leading-relaxed">
            By signing in, you are accessing a secure organizational platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
