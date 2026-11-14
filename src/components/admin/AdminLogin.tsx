import { User, signInWithPopup, signOut } from 'firebase/auth';
import { ArrowLeft, LogIn, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_IMAGES } from '../../data/defaultSiteData';
import { auth, googleProvider } from '../../lib/firebase';
import { SmartImage } from '../SmartImage';

interface AdminLoginProps {
  user: User | null;
  checkingRole: boolean;
  isAuthorized: boolean;
  onNavigateHome: () => void;
}

export function AdminLogin({
  user,
  checkingRole,
  isAuthorized,
  onNavigateHome,
}: AdminLoginProps) {
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg(msg);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setErrorMsg('');
    await signOut(auth);
  };

  return (
    <div className="min-h-screen islamic-lattice-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/15 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#B48A3E]/40 bg-[#FAF8F3] mb-4">
            <SmartImage
              src={DEFAULT_IMAGES.logo}
              alt="কুরআনী শিফা | QURANI SHIFA"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#064E3B] tracking-tight">
            কুরআনী শিফা · QURANI SHIFA
          </h1>
          <p className="mt-1 text-sm text-[#40544A]">
            অ্যাডমিন প্যানেল লগইন (Secure Admin Portal)
          </p>
        </div>

        <div className="mt-8 border-t border-[#064E3B]/10 pt-6">
          {checkingRole ? (
            <div className="py-6 text-center text-sm text-[#40544A]">
              অ্যাডমিন অনুমতি যাচাই করা হচ্ছে... (Verifying access...)
            </div>
          ) : user && !isAuthorized ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">অনুমতি নেই (Unauthorized Account)</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-900">
                      এই অ্যাকাউন্টটির অ্যাডমিন অ্যাক্সেস নেই। অনুগ্রহ করে অনুমোদিত অ্যাডমিন গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#FAF8F3] border border-[#064E3B]/10 p-3 text-xs text-[#40544A] space-y-1">
                <div>
                  <span className="font-semibold">Signed in email:</span> {user.email}
                </div>
                <div className="break-all">
                  <span className="font-semibold">User UID:</span> {user.uid}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>সাইন আউট করে অন্য অ্যাকাউন্ট দিন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-[#FAF8F3] border border-[#064E3B]/10 p-4 text-xs text-[#40544A] leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                <p>
                  নিরাপত্তার জন্য এখানে পাবলিক রেজিস্ট্রেশন বন্ধ রয়েছে। শুধুমাত্র অনুমোদিত অ্যাডমিন গুগল অ্যাকাউন্টের মাধ্যমে প্রবেশ করতে পারবেন।
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-lg bg-[#064E3B] text-[#FAF8F3] text-sm font-semibold hover:bg-[#053D2E] disabled:opacity-60 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#C9A254]" />
                <span>
                  {signingIn ? 'সাইন ইন হচ্ছে...' : 'গুগল দিয়ে অ্যাডমিন লগইন করুন (Sign in with Google)'}
                </span>
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52655B] hover:text-[#064E3B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল ওয়েবসাইটে ফিরে যান (Back to Public Website)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
